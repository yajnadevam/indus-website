


const qualityMap = new Map([
  ["POT:T:g", "Pottery"], ["TAG", "Tag"], ["SEAL:S", "Seal"],
  ["SEAL:R", "Seal"], ["TAG:P", "Tag"], ["SEAL:C", "Seal"],
  ["MISC", "Misc."], ["TAB:I", "Tablet"], ["POT:T:s", "Pottery"],
  ["TAB:B", "Tablet"], ["ROD", "Rod"], ["BNGL", "Bangle"],
  ["SEAL:CY", "Seal"], ["IMPL", "Impression"], // Not too sure about this
  ["SEAL", "Seal"], ["Oth", "Other"], ["TAG:L", "Tag"],
  ["POT:T:p", "Pottery"], ["SEAL:L", "Seal"], ["TAG:O", "Tag"],
  ["TAG:B", "Tag"], ["TAG:W", "Tag"], ["TAG:C", "Tag"],
  ["TAB:C", "Tag"], ["TAG:R", "Tag"], ]);
    


const symbolMap = new Map([
["None", "None"], ["Bull", "Bull"], ["Bull1", "One-horned bull"], ["Bull1:J", "One-horned bull"], ["Bull1:II", "One-horned bull"],
["Rhin", "Rhinoceros"], ["Goat:1", "Goat"], ["Bull1:O", "One-horned bull"], ["Bull3", "Three-horned bull"], ["Buff", "Water buffalo"],
["Goat:4", "Goat"], ["Goat:3", "Goat"], ["Htgr", "Hunting tiger"], ["Bull1:W", "One-horned bull"], ["Bull1:V", "One-horned bull"],
["Elep", "Elephant"], ["Gaur", "Gaur"], ["nan", "Unknown"], ["Bull1:I", "One-horned bull"], ["Bull1:S", "One-horned bull"],
["T-A-T", "Tiger-attacking-tiger"], ["Bull1:L", "One-horned bull"], ["Tigr", "Tiger"], ["S590", "Unknown"], ["Fish", "Fish"],
["Bult", "Bull with hump"], ["Bull1:U", "One-horned bull"], ["Gavi", "Rhinoceros"], ["Pipal", "Pipal tree"], ["Tri4", "Three-fish motif"],
["Mult", "Unknown"], ["Zebu", "Zebu"], ["Goat", "Goat"], ["Phyt", "Tree"], ["Scene", "Unknown"], ["Bird", "Bird"], ["Bull2", "Two-horned bull"],
["Bull1:X", "One-horned bull"], ["CompBull", "Composite animal (bull)"], ["Othr", "Unknown"], ["Anth", "Anthropomorphic figure"], ["Turt", "Turtle"],
["Goat:2", "Goat"], ["Bull1:T", "One-horned bull"], ["Xhch", "Crosshatched square"], ["Comp", "Composite animal"], ["Misc", "Miscellaneous"],
["Crs", "Cross"], ["Cros", "Cross"], ["Unknown", "Unknown"], ["Goat:6", "Goat"], ["T-M-T", "Three-headed deity"], ["Xcrs", "Crossed rods"],
["Box", "Box"], ["Loop", "Looped object"], ["Hare", "Hare"], ["Goat:8", "Goat"], ["Goat:7", "Goat"], ["Gavi+Bult", "Rhinoceros and bull"],
["Maze", "Maze pattern"], ["Ass", "Ass"]]);


export default {
  qualityMap,
  symbolMap
}