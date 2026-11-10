export const stations = {
  tiffin: { label: "Tiffin Counter", categories: ["Breakfast"], itemIds: ["masala-dosa"] },
  juice: { label: "Juice Counter", categories: ["Drinks"], itemIds: ["cold-coffee"] },
  bakery: { label: "Bakery Counter", categories: ["Bakery"], itemIds: [] },
  chat: { label: "Chat Counter", categories: ["Chat"], itemIds: [] },
};

export const getStationForItem = (item) => {
  const id = String(item?.id || "").toLowerCase();
  const category = String(item?.category || "").toLowerCase();
  if (category === "breakfast" || /idli|dosa|pongal|vada/.test(id)) return "tiffin";
  if (category === "drinks" || /juice|coffee|shake|lassi/.test(id)) return "juice";
  if (category === "bakery" || /puff|cake|bread|bun|pastry|brownie|dairy-milk|truffle/.test(id)) return "bakery";
  if (category === "chat" || /pani-puri|bhel|chaat|samosa|kachori|channa/.test(id)) return "chat";
  return "tiffin";
};
