export function createTextPreview(htmlContent, maxLength) {
  // 1. Create a dummy element to let the browser parse and strip the HTML tags
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  const rawText = tempDiv.textContent || tempDiv.innerText || "";

  // 2. Clean up extra whitespaces or line breaks
  const cleanedText = rawText.replace(/\s+/g, " ").trim();

  // 3. Truncate text and add an ellipsis if it's longer than our max limit
  if (cleanedText.length > maxLength) {
    return cleanedText.substring(0, maxLength) + "...";
  }

  return cleanedText;
}