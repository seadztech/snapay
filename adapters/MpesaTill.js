module.exports = function MpesaAlt(message) {
  try {
    const normalizedMessage = message
      .trim()
      .replace(/\s+/g, " ")
      .replace(/Confirmed\./i, "Confirmed. "); // fix missing space cases

    // Reference code (first word)
    const referencePattern = /^(\w+)/;

    // Date & time (original)
    const timePattern =
      /on\s+(\d{1,2}\/\d{1,2}\/\d{2})\s+at\s+([\d:]+\s*[APMapm]{2})/;

    // NEW: fallback for missing spaces like "Confirmed.on" or "PMKsh"
    const timePattern2 =
      /on\s*(\d{1,2}\/\d{1,2}\/\d{2})\s*at\s*([\d:]+\s*[APMapm]{2})/i;

    // Amount received (original)
    const amountPattern = /Ksh\s*([\d,.]+)\s+received/i;

    // NEW: fallback when no space before/after
    const amountPattern2 = /Ksh\s*([\d,.]+)\s*received/i;

    // Sender phone + name (original)
    const senderPattern =
      /received\s+from\s+(\d{10,13})\s+([A-Za-z\s]+)/i;

    // NEW: till number with dash
    const senderPattern3 =
      /received\s+from\s+(\d{5,13})\s*-\s*([A-Za-z\s]+)/i;

    // Existing fallback
    const senderPattern2 =
      /received\s+from\s+(\d{5,13})(?:\s+([\d]{5,10}))?(?:\s*-\s*)?\s*([A-Za-z\s]+)?/i;

    const referenceMatch = normalizedMessage.match(referencePattern);

    let timeMatch = normalizedMessage.match(timePattern);
    if (!timeMatch) {
      timeMatch = normalizedMessage.match(timePattern2);
    }

    let amountMatch = normalizedMessage.match(amountPattern);
    if (!amountMatch) {
      amountMatch = normalizedMessage.match(amountPattern2);
    }

    let senderMatch = normalizedMessage.match(senderPattern);
    if (!senderMatch) {
      senderMatch = normalizedMessage.match(senderPattern3);
    }
    if (!senderMatch) {
      senderMatch = normalizedMessage.match(senderPattern2);
    }

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

      const timeString = timeMatch[2];

      const dateTimeString = `20${year}-${month}-${day} ${timeString}`;
      transactionDate = new Date(dateTimeString);

      if (isNaN(transactionDate.getTime())) {
        transactionDate = null;
      }
    }

    if (!referenceMatch || !timeMatch || !amountMatch || !senderMatch) {
      return {
        reference: referenceMatch?.[1] ?? null,
        senderName:
          senderMatch?.[2]?.trim() || senderMatch?.[3]?.trim() || null,
        senderPhone: senderMatch?.[1] ?? null,
        transactionTime: transactionDate,
        amount,
        error:
          "Invalid MPESA message format: Missing some required details.",
      };
    }

    return {
      reference: referenceMatch[1],
      senderName:
        senderMatch[2]?.trim() || senderMatch[3]?.trim() || null,
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


// module.exports = function MpesaAlt(message) {
//   try {
//     const normalizedMessage = message.trim().replace(/\s+/g, " ");

//     // Reference code (first word)
//     const referencePattern = /^(\w+)/;

//     // Date & time: "on 11/1/26 at 7:37 PM"
//     const timePattern =
//       /on\s+(\d{1,2}\/\d{1,2}\/\d{2})\s+at\s+([\d:]+\s*[APMapm]{2})/;

//     // Amount received: "Ksh120.00 received"
//     const amountPattern = /Ksh\s*([\d,.]+)\s+received/i;

//     // Sender phone + name:
//     // "received from 254726508372 dickson kipkoech"
//     const senderPattern = /received\s+from\s+(\d{10,13})\s+([A-Za-z\s]+)/i;
//     // Sender info (phone or till, optional name)




//     const referenceMatch = normalizedMessage.match(referencePattern);
//     const timeMatch = normalizedMessage.match(timePattern);
//     const amountMatch = normalizedMessage.match(amountPattern);
//     let senderMatch = normalizedMessage.match(senderPattern);

//     // Amount
//     const amount = amountMatch
//       ? parseFloat(amountMatch[1].replace(/,/g, ""))
//       : null;

//     // Transaction date
//     let transactionDate = null;
//     if (timeMatch) {
//       const [day, month, year] = timeMatch[1]
//         .split("/")
//         .map((n) => parseInt(n, 10));

//       const timeString = timeMatch[2]; // "7:37 PM"
//       const dateTimeString = `20${year}-${month}-${day} ${timeString}`;
//       transactionDate = new Date(dateTimeString);

//       if (isNaN(transactionDate.getTime())) {
//         transactionDate = null;
//       }
//     }

//     if (!senderMatch) {
//       const senderPattern2 =
//         /received\s+from\s+(\d{5,13})(?:\s+([\d]{5,10}))?(?:\s*-\s*)?\s*([A-Za-z\s]+)?/i;

//       senderMatch = normalizedMessage.match(senderPattern2);
//     }

//     if (!referenceMatch || !timeMatch || !amountMatch || !senderMatch) {
//       return {
//         reference: referenceMatch?.[1] ?? null,
//         senderName: senderMatch?.[2]?.trim() ?? null,
//         senderPhone: senderMatch?.[1] ?? null,
//         transactionTime: transactionDate,
//         amount,
//         error: "Invalid MPESA message format: Missing some required details.",
//       };
//     }

//     return {
//       reference: referenceMatch[1],
//       senderName: senderMatch[2].trim(),
//       senderPhone: senderMatch[1],
//       transactionTime: transactionDate,
//       amount,
//     };
//   } catch (error) {
//     return {
//       reference: null,
//       senderName: null,
//       senderPhone: null,
//       transactionTime: null,
//       amount: null,
//       error: error.message,
//     };
//   }
// };
