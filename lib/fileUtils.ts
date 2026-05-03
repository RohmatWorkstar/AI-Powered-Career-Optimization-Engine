import pdf from "pdf-parse";
import mammoth from "mammoth";

/**
 * Extracts raw text from uploaded file (PDF, DOCX, or Plain Text).
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      const data = await pdf(buffer);
      return data.text.slice(0, 10000);
    } 
    
    if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      fileName.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.slice(0, 10000);
    }

    // Treat all other uploads as plain text
    const text = new TextDecoder("utf-8").decode(buffer);
    return text.slice(0, 10000); 
  } catch (error) {
    console.error("[extractTextFromFile] Error:", error);
    // Fallback to basic decoding if library fails
    return new TextDecoder("utf-8").decode(buffer).slice(0, 5000);
  }
}
