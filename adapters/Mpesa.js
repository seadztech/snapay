module.exports = function Mpesa(message) {
  try {
    // Trim leading/trailing spaces and normalize multiple spaces
    const normalizedMessage = message.trim().replace(/\s+/g, " ");

    const referencePattern = /^(\w+)/; // Extracts the first word (reference code)
    const senderPattern = /from\s+([\w\s]+?)(?:\s+(\d{10}))?\s+on/; // Extracts sender's name and optionally phone number
    const timePattern =
      /on\s+(\d{1,2}\/\d{1,2}\/\d{2})\s+at\s+([\d:]+\s*[APMapm]{2})/; // Extracts date and time
    const amountPattern = /received\s+Ksh\s*([\d,.]+)/i; // Extracts transaction amount

    const referenceMatch = normalizedMessage.match(referencePattern);
    const senderMatch = normalizedMessage.match(senderPattern);
    const timeMatch = normalizedMessage.match(timePattern);
    const amountMatch = normalizedMessage.match(amountPattern);

    // Convert amount to number if found, otherwise null
    const amount = amountMatch
      ? parseFloat(amountMatch[1].replace(/,/g, ""))
      : null;

    // Convert time to Date object
    let transactionDate = null;
    if (timeMatch) {
      const [day, month, year] = timeMatch[1]
        .split("/")
        .map((num) => parseInt(num, 10));
      const timeString = timeMatch[2]; // e.g., "3:37 PM"
      const dateTimeString = `20${year}-${month}-${day} ${timeString}`;
      transactionDate = new Date(dateTimeString);

      if (isNaN(transactionDate.getTime())) {
        transactionDate = null;
      }
    }

    // If any critical field is missing, return an object with extracted data + error message
    if (!referenceMatch || !senderMatch || !timeMatch || !amountMatch) {
      return {
        reference: referenceMatch ? referenceMatch[1] : null,
        senderName: senderMatch ? senderMatch[1].trim() : null,
        senderPhone: senderMatch && senderMatch[2] ? senderMatch[2] : null,
        transactionTime: transactionDate,
        amount: amount,
        error: "Invalid MPESA message format: Missing some required details.",
      };
    }

    return {
      reference: referenceMatch[1],
      senderName: senderMatch[1].trim(),
      senderPhone: senderMatch[2] || null,
      transactionTime: transactionDate,
      amount: amount,
    };
  } catch (error) {
    console.error("Error extracting MPESA details:", error.message);
    return {
      reference: null,
      senderName: null,
      senderPhone: null,
      transactionTime: null,
      amount: null,
      error: error.message,
    };
  }
};
