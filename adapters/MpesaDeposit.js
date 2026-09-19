module.exports = function MpesaDeposit(message) {
    try {
        const normalizedMessage = message.trim().replace(/\s+/g, " ");

        const referencePattern = /^(\w+)/;
        const amountPattern = /Give\s+Ksh\s*([\d,.]+)/i;
        const timePattern =
            /On\s+(\d{1,2}\/\d{1,2}\/\d{2})\s+at\s+([\d:]+\s*[APMapm]{2})/;
        const recipientPattern =
            /cash\s+to\s+(.+?)\s+New M-PESA balance/i;

        const referenceMatch = normalizedMessage.match(referencePattern);
        const amountMatch = normalizedMessage.match(amountPattern);
        const timeMatch = normalizedMessage.match(timePattern);
        const recipientMatch = normalizedMessage.match(recipientPattern);

        const amount = amountMatch
            ? parseFloat(amountMatch[1].replace(/,/g, ""))
            : null;

        let transactionDate = null;
        if (timeMatch) {
            const [day, month, year] = timeMatch[1]
                .split("/")
                .map((num) => parseInt(num, 10));

            const timeString = timeMatch[2];
            const dateTimeString = `20${year}-${month}-${day} ${timeString}`;
            transactionDate = new Date(dateTimeString);

            if (isNaN(transactionDate.getTime())) {
                transactionDate = null;
            }
        }

        if (!referenceMatch || !amountMatch || !timeMatch || !recipientMatch) {
            return {
                reference: referenceMatch ? referenceMatch[1] : null,
                senderName: recipientMatch ? recipientMatch[1].trim() : null,
                transactionTime: transactionDate,
                amount: amount,
                error: "Invalid MPESA deposit message format.",
            };
        }

        return {
            reference: referenceMatch[1],
            senderName: recipientMatch[1].trim(),
            transactionTime: transactionDate,
            amount: amount,
        };
    } catch (error) {
        console.error("Error extracting MPESA deposit details:", error.message);
        return {
            reference: null,
            senderName: null,
            transactionTime: null,
            amount: null,
            error: error.message,
        };
    }
};