import request from "supertest";
import app from "../../api/v1";

describe("Image Transformation API Integration Tests", () => {
  it("should transform image with specified parameters", async () => {
    const imagePath = "https://picsum.photos/200/300";

    const response = await request(app).get("/").query({
      src: imagePath,
      fm: "jpeg",
      width: "240",
      height: "180",
      quality: "80",
    });

    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toContain("image/jpeg");
  });

  it("should handle missing src parameter gracefully", async () => {
    const response = await request(app).get("/").query({
      fm: "jpeg",
      width: "240",
      height: "180",
      quality: "80",
    });

    expect(response.status).toEqual(400);
  });
});
