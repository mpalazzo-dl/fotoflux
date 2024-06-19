import express, { Request, Response } from "express";
import sharp from "sharp";
import axios from "axios";

const app = express();

app.get("/", async (req: Request, res: Response) => {
  let { src, fm, width, height, scale, quality } = req.query as {
    src: string;
    fm?: "jpeg" | "png" | "webp" | "gif";
    width?: string;
    height?: string;
    scale?: string;
    quality?: string;
  };

  if (!src) {
    console.error("Missing src parameter");
    return res.status(400).send("Missing src parameter");
  }

  if (src.startsWith("/") || src.startsWith(".")) {
    const referer = req.get("referer");
    if (referer) {
      const { protocol, host } = new URL(referer);
      src = `${protocol}//${host}${src}`;
    } else {
      console.error("Missing Referer header");
      return res.status(400).send("Missing Referer header");
    }
  }

  try {
    // Fetch the original image
    const response = await axios.get(src, { responseType: "arraybuffer" });

    // Apply transformations using Sharp
    let image = sharp(response.data);

    if (fm) {
      // Convert image format if specified
      image = image.toFormat(fm);
    }

    if (width && height) {
      // Resize image to exact dimensions
      image = image.resize(parseInt(width, 10), parseInt(height, 10));
    } else if (scale) {
      // Resize image by scale percentage
      const scaleValue = parseFloat(scale) / 100; // Convert scale percentage to decimal
      image = image.resize({ width: Math.round(scaleValue * 100) }); // Adjust width proportionally
    }

    if (quality) {
      // Adjust image quality
      switch (fm) {
        case "jpeg":
          image = image.jpeg({ quality: parseInt(quality, 10) });
          break;
        case "png":
          image = image.png({ quality: parseInt(quality, 10) });
          break;
        case "webp":
          image = image.webp({ quality: parseInt(quality, 10) });
          break;
        default:
          break;
      }
    }

    // Generate and send transformed image
    const transformedImageBuffer = await image.toBuffer();
    res.setHeader("Content-Type", `image/${fm || "jpeg"}`);
    res.send(transformedImageBuffer);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching or transforming image:", error);
      res.status(500).send("Error processing image: " + error.message);
    } else {
      console.error("Unknown error:", error);
      res.status(500).send("Unknown error occurred");
    }
  }
});

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

export default app;
