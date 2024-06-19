import axios from "axios";
import sharp, { Sharp } from "sharp";
import request from "supertest";
import app from "../../api/v1";

jest.mock("axios");
jest.mock("sharp");

describe("Image Transformation Unit Tests", () => {
  const imagePath = "https://picsum.photos/200/300";

  beforeAll(() => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: Buffer.from("image-data"),
    });

    const mockSharpInstance: Partial<Sharp> = {
      toFormat: jest.fn().mockReturnThis(),
      resize: jest.fn().mockReturnThis(),
      jpeg: jest.fn().mockReturnThis(),
      toBuffer: jest
        .fn()
        .mockResolvedValue(
          Buffer.from("transformed-image-data")
        ) as Sharp["toBuffer"],
    };

    const mockSharp = sharp as jest.MockedFunction<typeof sharp>;
    mockSharp.mockImplementation(() => mockSharpInstance as Sharp);
  });

  it("should transform image correctly", async () => {
    const response = await request(app).get("/").query({
      src: imagePath,
      fm: "png",
      width: "240",
      height: "180",
      quality: "80",
    });

    expect(axios.get).toHaveBeenCalledWith(imagePath, {
      responseType: "arraybuffer",
    });
    expect(sharp().toFormat).toHaveBeenCalledWith("png");
    expect(sharp().resize).toHaveBeenCalledWith(240, 180);
    expect(sharp().jpeg).toHaveBeenCalledWith({ quality: 80 });
    expect(response.status).toBe(200);
    expect(response.header["content-type"]).toBe("image/png");
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
