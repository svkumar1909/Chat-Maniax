export function formatMessageTime(date) {
  const messageDate = new Date(date);
  
  // Format the date as "Month Day, Year" (e.g., "January 13, 2025")
  const formattedDate = messageDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format the time as "Hour:Minute" in 24-hour format (e.g., "10:30")
  const formattedTime = messageDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Combine both date and time for the final formatted string
  return `${formattedDate} at ${formattedTime}`;
}
