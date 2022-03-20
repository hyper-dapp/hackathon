export function btnClass({
  size = "md",
}: {
  size?: "md" | "lg";
} = {}) {
  var classes = "";
  if (size === "md") {
    classes += "px-3 py-1.5 text-base font-medium";
  } else if (size === "lg") {
    classes += "px-4 py-1.5 text-lg font-medium";
  }
  return `
    inline-flex items-center justify-center border border-transparent rounded-full shadow-sm text-white
    bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:hover:bg-gray-600
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
    ${classes}
  `.replace(/\s+/, " ");
}
