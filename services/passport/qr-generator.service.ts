import QRCode from "qrcode";

export interface IQRCodeResult {
  dataUrl: string;
  svg: string;
  targetUrl: string;
}

/**
 * Generates both DataURL (PNG) and raw SVG for a public passport URL.
 */
export async function generatePassportQRCode(
  publicId: string,
  baseUrl?: string
): Promise<IQRCodeResult> {
  const host =
    baseUrl ||
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const cleanHost = host.replace(/\/+$/, "");
  const targetUrl = `${cleanHost}/passport/${encodeURIComponent(publicId)}`;

  const [dataUrl, svg] = await Promise.all([
    QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 2,
      width: 256,
      color: {
        dark: "#1e293b", // Slate 800
        light: "#ffffff",
      },
    }),
    QRCode.toString(targetUrl, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 2,
      color: {
        dark: "#1e293b",
        light: "#ffffff",
      },
    }),
  ]);

  return {
    dataUrl,
    svg,
    targetUrl,
  };
}
