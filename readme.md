# Automatically generate alt text descriptions of images in a web (HTML) page

Images in web (HTML) pages should always have "alt" text descriptions of the images. Text descriptions appear in place of images, if the images fail to load on a user's screen. Text descriptions also help screen-reading tools describe images to visually impaired readers and allow search engines to better crawl and rank web sites.

This project shows how to use the Google Generative AI API to access the Gemini Pro Vision model and send multimodal payloads of text and image data to the Gemini API to receive text-only responses.

You need a Google API key for this project. [Get your Google API key here](https://makersuite.google.com/app/apikey). Insert your Google API key in the `script.js` file.

This project reads a local HTML file called `input.html`, searches the file for "\<img\>" tags and adds "alt" attributes with text descriptions to all images that have no "alt" attributes.

If it finds an existing "alt" attribute with a text description of an image, then it uses the Gemini Pro Vision model to check, if the text description of the image is "good enough". It the model determines that the text description is not accurate, then it automatically replaces the bad text description with a better one.

It saves the new version of the local web (HTML) page as `output.html`.

This project uses Node.js. You might therefore have to install [Node.js](https://nodejs.org/en) first.

Then you need to install the dependencies:
```
npm install
```

You can run the script with:
```
node script.js
```

This is the content of the `input.html` file:
```
<html>
  <head>
    <title>A web (HTML) page with 3 images</title>
  </head>
  <body>
    <!-- Car image with no alt attribute: Should be added -->
    <img src="car.jpeg" />
    <!-- Airplane image with "good enough" alt attribute: Should be left unchanged -->
    <img src="airplane.jpeg" alt="It's an airplane." />
    <!-- Cruise ship image with bad alt attribute: Should be replaced -->
    <img src="cruise-ship.jpeg" alt="A bad image description." />
  </body>
</html>
```

This is an example `output.html` result. Please note that the text descriptions will vary, as the model can generate different answers. You can set the creativity of the model by tuning the "temperature" setting in the `script.js` file. The temperature must be between 0.0 and 1.0. A value closer to 1.0 will generate responses that are more creative, and a value closer to 0.0 will usually result in more standard responses.
```
<html>
  <head>
    <title>A web (HTML) page with 3 images</title>
  </head>
  <body>
    <!-- Car image with no alt attribute: Should be added -->
    <img src="car.jpeg" alt="A sleek and futuristic white and blue sports car.">
    <!-- Airplane image with "good enough" alt attribute: Should be left unchanged -->
    <img src="airplane.jpeg" alt="It's an airplane.">
    <!-- Cruise ship image with bad alt attribute: Should be replaced -->
    <img src="cruise-ship.jpeg" alt="A large cruise ship is floating on the ocean.">
  </body>
</html>
```
