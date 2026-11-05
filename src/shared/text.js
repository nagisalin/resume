// 中文排版：把「不該斷行的空格」換成不斷行空格（U+00A0），避免：
//   「2024 起」被拆成 2024 / 起、「React / Vue」被拆成 React / 、 Vue、「與 RWD」把 RWD 丟到下一行
// 只黏「英數↔中文」與「A / B」這種短組合；英文詞與詞之間（如 Node + Docker）仍可正常斷行，不會爆版。
const NB = String.fromCharCode(160); // 不斷行空格（NBSP）
export const glue = (s) =>
	(s == null ? '' : String(s))
		.replace(/[ \t]+\/[ \t]+/g, NB + '/' + NB) // A / B
		.replace(/([0-9A-Za-z])[ \t]+(?=[一-鿿])/g, '$1' + NB) // 英數 + 中文
		.replace(/([一-鿿])[ \t]+(?=[0-9A-Za-z])/g, '$1' + NB); // 中文 + 英數
