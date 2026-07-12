import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { THERMAL_RECEIPT_WIDTH_MM } from "@/lib/admin/receipt-order";

function captureReceiptElement(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = "fixed";
  clone.style.left = "-10000px";
  clone.style.top = "0";
  clone.style.width = `${THERMAL_RECEIPT_WIDTH_MM}mm`;
  clone.style.maxWidth = `${THERMAL_RECEIPT_WIDTH_MM}mm`;
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.boxShadow = "none";
  document.body.appendChild(clone);
  return clone;
}

export async function downloadReceiptPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const captureEl = captureReceiptElement(element);

  try {
    const canvas = await html2canvas(captureEl, {
      scale: 3,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      width: captureEl.offsetWidth,
      height: captureEl.offsetHeight,
    });

    const widthMm = THERMAL_RECEIPT_WIDTH_MM;
    const heightMm = (canvas.height * widthMm) / canvas.width;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [widthMm, heightMm],
      compress: true,
    });

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      widthMm,
      heightMm,
      undefined,
      "FAST",
    );
    pdf.save(filename);
  } finally {
    captureEl.remove();
  }
}
