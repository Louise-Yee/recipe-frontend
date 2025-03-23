/* eslint-disable @typescript-eslint/no-explicit-any */

export function errorHandler(error: any, from: string, source: string) {
    // Get the error message or stringify the error if it's an object
    const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'string' ? error : JSON.stringify(error));

    // Create a formatted error message
    const formattedMessage = `[${source}] Error in ${from}: ${errorMessage}`;

    // Log the formatted error message to the console
    console.error(formattedMessage);

    // Log the stack trace if available
    if (error instanceof Error && error.stack) {
        console.error(`Stack trace: ${error.stack}`);
    }

    // Return the formatted message for use in the UI if needed
    return formattedMessage;
}
