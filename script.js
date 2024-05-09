const { GoogleGenerativeAI } = require("@google/generative-ai");
const cheerio = require("cheerio");
const fs = require("fs");
const { join } = require("path");

const generationConfig = {
  temperature: 0.7,
  candidateCount: 1,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

const safetySettings = [
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_NONE",
  },
];

const genAI = new GoogleGenerativeAI("REPLACE_THIS_WITH_YOUR_GOOGLE_API_KEY");

const model = genAI.getGenerativeModel({
  model: "gemini-pro-vision",
});

async function main() {
  const html = fs.readFileSync("input.html", "utf8");
  const $ = cheerio.load(html);

  const promises = [];

  $("img").each(function (i, element) {
    promises.push(
      new Promise(async (resolve, reject) => {
        const src = $(element).attr("src");
        const originalAlt = $(element).attr("alt");

        if (!fs.existsSync(src)) {
          console.log("Image doesn't exist:", src);
          resolve(false);
          return;
        }

        const base64Image = Buffer.from(fs.readFileSync(join(__dirname, src))).toString("base64");

        let answer = false;

        if (originalAlt !== undefined) {
          answer = await askBoolean(
            "Does this description describe the image well?\n" + originalAlt,
            base64Image
          );

          if (answer) {
            console.log("Alt text is already defined:", originalAlt);

            resolve(false);
            return;
          } else {
            console.log(
              "Alt text already exists but is not good enough:",
              originalAlt
            );
          }
        }

        const geminiRead = await model
          .generateContent({
            generationConfig,
            safetySettings,
            contents: [
              {
                role: "user",
                parts: [
                  { text: "What is in this picture? Give a short one sentence description. " +
                  "Do not use the words picture or image in your answer." },
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
          })
          .then((result) => {
            return extractText(result);
          });

        $(element).attr("alt", geminiRead.trim());

        console.log("Updated alt text for", src, "image:", geminiRead.trim());
        resolve(true);
      })
    );
  });

  Promise.all(promises).then((values) => {
    const updatedHTML = $.html();
    fs.writeFileSync("output.html", updatedHTML);
  });
}

main();

function extractText(obj) {
  try {
    return obj.response.candidates[0].content.parts[0].text;
  } catch (e) {
    return undefined;
  }
}

async function askBoolean(question, base64Image) {
  return await model
    .generateContent({
      generationConfig,
      safetySettings,
      contents: [
        {
          role: "user",
          parts: [
            { text: question + "\nAnswer with just one word, either 'yes' or 'no'." },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
    })
    .then((result) => {
      return extractText(result, "text").toLowerCase().includes("yes");
    });
}
