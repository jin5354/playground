
// 1. \b 匹配单词边界 \B 匹配非单词边界

// 使用正则为将数字格式化为英文格式数字：

// ```
// let str = '1234567890'

// str.replace(/\B(?=(\d{3})+(?!\d))/g, ',') //
// ```

//   \B    (?=             (\d{3})+        (?!\d))             )
// (边界)   (其后必须跟随     3/6/9..个数字    再下一个字符不能为数字 )

// 1|234|567|890 匹配出来的边界为零宽

/**
 * formatNumber
 *
 * @export
 * @param {number} source
 * @returns
 */
export function formatNumber(source: number): string {
  return String(source).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

