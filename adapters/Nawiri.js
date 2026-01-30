module.exports = function Nawiri(message) {
  try {
    // Trim leading/trailing spaces and normalize multiple spaces
    const normalizedMessage = message.trim().replace(/\s+/g, " ");

    // Regex patterns for extracting details
    const amountPattern = /KES\s*([\d,.]+)\s*has been credited/i; // Extracts transaction amount
    const accountPattern = /account\s*No:\s*([\dX]+)/i; // Extracts account number
    const datePattern = /on:\s*(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2}:\d{2})/; // Extracts transaction date and time
    const senderPattern = /Detail:\s*([\w]+)/; // Extracts sender's name (ensures it's one word)
    const referencePattern = /Mpesa Ref:\s*(\w+)/i; // Extracts reference

    // Match message against patterns
    const amountMatch = normalizedMessage.match(amountPattern);
    const accountMatch = normalizedMessage.match(accountPattern);
    const dateMatch = normalizedMessage.match(datePattern);
    const senderMatch = normalizedMessage.match(senderPattern);
    const referenceMatch = normalizedMessage.match(referencePattern);

    // Convert amount to a number if found, otherwise null
    const amount = amountMatch
      ? parseFloat(amountMatch[1].replace(/,/g, ""))
      : null;

    // Convert extracted date and time to a Date object
    let transactionDate = null;
    if (dateMatch) {
      const [year, month, day] = dateMatch[1]
        .split("-")
        .map((num) => parseInt(num, 10));
      const [hours, minutes, seconds] = dateMatch[2]
        .split(":")
        .map((num) => parseInt(num, 10));
      transactionDate = new Date(year, month - 1, day, hours, minutes, seconds);

      if (isNaN(transactionDate.getTime())) {
        transactionDate = null;
      }
    }

    // If any required field is missing, return partial data with an error message
    if (
      !amountMatch ||
      !accountMatch ||
      !dateMatch ||
      !senderMatch ||
      !referenceMatch
    ) {
      return {
        amount: amount,
        senderName: senderMatch ? senderMatch[1].trim() : null,
        reference: referenceMatch ? referenceMatch[1] : null,
        transactionTime: transactionDate,
        account: accountMatch ? accountMatch[1] : null,
        error:
          "Invalid Nawiri message format: Some required details are missing.",
      };
    }

    // Return extracted details
    return {
      amount: amount,
      senderName: senderMatch[1].trim(), // Ensuring only one word (single name)
      reference: referenceMatch[1], // Correct field name
      transactionTime: transactionDate,
      account: accountMatch[1],
    };
  } catch (error) {
    console.error("Error extracting Nawiri details:", error.message);
    return {
      amount: null,
      senderName: null,
      reference: null,
      transactionTime: null,
      account: null,
      error: error.message,
    };
  }
};
