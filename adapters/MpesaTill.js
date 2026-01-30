module.exports = function MpesaAlt(message) {
  try {
    const normalizedMessage = message.trim().replace(/\s+/g, " ");

    // Reference code (first word)
    const referencePattern = /^(\w+)/;

    // Date & time: "on 11/1/26 at 7:37 PM"
    const timePattern =
      /on\s+(\d{1,2}\/\d{1,2}\/\d{2})\s+at\s+([\d:]+\s*[APMapm]{2})/;

    // Amount received: "Ksh120.00 received"
    const amountPattern = /Ksh\s*([\d,.]+)\s+received/i;

    // Sender phone + name:
    // "received from 254726508372 dickson kipkoech"
    const senderPattern = /received\s+from\s+(\d{10,13})\s+([A-Za-z\s]+)/i;

    const referenceMatch = normalizedMessage.match(referencePattern);
    const timeMatch = normalizedMessage.match(timePattern);
    const amountMatch = normalizedMessage.match(amountPattern);
    const senderMatch = normalizedMessage.match(senderPattern);

    // Amount
    const amount = amountMatch
      ? parseFloat(amountMatch[1].replace(/,/g, ""))
      : null;

    // Transaction date
    let transactionDate = null;
    if (timeMatch) {
      const [day, month, year] = timeMatch[1]
        .split("/")
        .map((n) => parseInt(n, 10));

      const timeString = timeMatch[2]; // "7:37 PM"
      const dateTimeString = `20${year}-${month}-${day} ${timeString}`;
      transactionDate = new Date(dateTimeString);

      if (isNaN(transactionDate.getTime())) {
        transactionDate = null;
      }
    }

    if (!referenceMatch || !timeMatch || !amountMatch || !senderMatch) {
      return {
        reference: referenceMatch?.[1] ?? null,
        senderName: senderMatch?.[2]?.trim() ?? null,
        senderPhone: senderMatch?.[1] ?? null,
        transactionTime: transactionDate,
        amount,
        error: "Invalid MPESA message format: Missing some required details.",
      };
    }

    return {
      reference: referenceMatch[1],
      senderName: senderMatch[2].trim(),
      senderPhone: senderMatch[1],
      transactionTime: transactionDate,
      amount,
    };
  } catch (error) {
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
