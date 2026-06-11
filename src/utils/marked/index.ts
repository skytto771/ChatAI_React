import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { Marked } from 'marked'


// 配置Marked.js
export const marked = new Marked(
    markedHighlight({
        async: false, // 如果是异步的，可以设置为 true
        langPrefix: 'language-', // 可选：用于给代码块添加前缀
        highlight: code => {
            return hljs.highlightAuto(code).value
        },
    })
)
