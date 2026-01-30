module.exports = function Winas(message) {
  try {
    // Trim leading/trailing spaces and normalize multiple spaces
    const normalizedMessage = message.trim().replace(/\s+/g, " ");

    // Regex patterns for extracting details
    const referencePattern = /Confirmed\s+(\w+)/; // Extracts reference code
    const datePattern = /on\s+(\d{2}\/\d{2}\/\d{4})/; // Extracts transaction date
    const accountPattern = /your account\s+([\d\-]+)/; // Extracts account number
    const amountPattern = /amount:\s*([\d,.]+)/i; // Extracts transaction amount
    const senderPattern = /from\s+(\d{12})\s+([\w\s]+)/; // Extracts sender phone number & name

    // Match message against patterns
    const referenceMatch = normalizedMessage.match(referencePattern);
    const dateMatch = normalizedMessage.match(datePattern);
    const accountMatch = normalizedMessage.match(accountPattern);
    const amountMatch = normalizedMessage.match(amountPattern);
    const senderMatch = normalizedMessage.match(senderPattern);

    // Convert amount to a number if found, otherwise null
    const amount = amountMatch
      ? parseFloat(amountMatch[1].replace(/,/g, ""))
      : null;

    // Convert extracted date to Date object (with current time)
    let transactionDate = null;
    if (dateMatch) {
      const [day, month, year] = dateMatch[1]
        .split("/")
        .map((num) => parseInt(num, 10));
      const now = new Date();
      transactionDate = new Date(
        year,
        month - 1,
        day,
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      );

      if (isNaN(transactionDate.getTime())) {
        transactionDate = null;
      }
    }

    // If any required field is missing, return partial data with an error message
    if (
      !referenceMatch ||
      !dateMatch ||
      !accountMatch ||
      !amountMatch ||
      !senderMatch
    ) {
      return {
        reference: referenceMatch ? referenceMatch[1] : null,
        transactionTime: transactionDate,
        account: accountMatch ? accountMatch[1] : null,
        amount: amount,
        senderNumber: senderMatch ? senderMatch[1] : null,
        senderName: senderMatch ? senderMatch[2].trim() : null,
        error:
          "Invalid Winas message format: Some required details are missing.",
      };
    }

    // Return extracted details
    return {
      reference: referenceMatch[1],
      transactionTime: transactionDate,
      account: accountMatch[1],
      amount: amount,
      senderNumber: senderMatch[1],
      senderName: senderMatch[2].trim(),
    };
  } catch (error) {
    console.error("Error extracting Winas details:", error.message);
    return {
      reference: null,
      transactionTime: null,
      account: null,
      amount: null,
      senderNumber: null,
      senderName: null,
      error: error.message,
    };
  }
};
