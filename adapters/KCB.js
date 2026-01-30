module.exports = function KCB(message) {
  try {
    // Trim leading/trailing spaces and normalize multiple spaces
    const normalizedMessage = message.trim().replace(/\s+/g, " ");

    // Regex patterns for extracting details
    const amountPattern = /received\s+KES\s*([\d,.]+)/i; // Extracts transaction amount
    const senderPattern = /from\s+([\w\s]+)\./; // Extracts sender's name
    const mpesaRefPattern = /M-PESA Ref\s+(\w+)/; // Extracts M-PESA reference
    const transactionRefPattern = /Transaction Ref No\s+(\w+)/; // Extracts Transaction Reference

    // Match message against patterns
    const amountMatch = normalizedMessage.match(amountPattern);
    const senderMatch = normalizedMessage.match(senderPattern);
    const mpesaRefMatch = normalizedMessage.match(mpesaRefPattern);
    const transactionRefMatch = normalizedMessage.match(transactionRefPattern);

    // Convert amount to a number if found, otherwise null
    const amount = amountMatch
      ? parseFloat(amountMatch[1].replace(/,/g, ""))
      : null;

    // If any required field is missing, return partial data with an error message
    if (
      !amountMatch ||
      !senderMatch ||
      !mpesaRefMatch ||
      !transactionRefMatch
    ) {
      return {
        amount: amount,
        senderName: senderMatch ? senderMatch[1].trim() : null,
        reference: mpesaRefMatch ? mpesaRefMatch[1] : null,
        transactionReference: transactionRefMatch
          ? transactionRefMatch[1]
          : null,
        error: "Invalid KCB message format: Some required details are missing.",
      };
    }

    // Return extracted details
    return {
      amount: amount,
      senderName: senderMatch[1].trim(),
      reference: mpesaRefMatch[1], // M-PESA reference
      transactionReference: transactionRefMatch[1], // Transaction reference
    };
  } catch (error) {
    console.error("Error extracting KCB details:", error.message);
    return {
      amount: null,
      senderName: null,
      reference: null,
      transactionReference: null,
      error: error.message,
    };
  }
};
