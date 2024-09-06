import React, { useState} from "react";
import {Text, useInput} from 'ink'
import {useAsync} from "react-use";
import {$} from "bun";
import moment from "moment";
import axios from "axios";

export default function App() {
    const [log, setLog] = useState<string>()
    const dir = "???";
    const [systemMsg, ] = useState<string>(
        `这是一个虚拟币交易所 Web 项目，基于 React 构建，请根据本周的 Git 提交日志生成一份简短的周报。周报应按以下顺序包括内容：
1. 主要完成的工作和功能更新；
2. 修复的 Bug 及其相关背景；
3. 进行的优化或改进。

请确保周报内容控制在 10 条以内的普通文本，按上述顺序排列。如果内容过多，请缩减优化文案；
请直接按序列号输出文本，不要使用 Markdown 格式，行与行之间不要空行，也不要显示提交哈希和日期。`
    );
    const [result, setResult] = useState<string>()



    useAsync(async () => {
        const today = moment().format("YYYY-MM-DD");
        const firstDayOfWeekWithTime = moment()
            .startOf("week")
            .format("YYYY-MM-DD");
        const log = await $`cd ${dir} && git log --since="${firstDayOfWeekWithTime}" --until="${today}" --pretty=format:"%an,%ae,%ad,%s,%b" --date=iso`
        setLog(log.text())
    }, [])

    useAsync(async () => {
        if (!log) return
        const resp = await axios.post<{ data: string }>(
            "https://ai-weekly-report-server.ygsgdbd.workers.dev/api/v1/openai/batch",
            {
                inputs: [`${systemMsg}\r\n ${log}`],
                openAI: {},
            }
        )
        if (resp.data) {
            setResult(resp.data.data)
        }
    }, [log])

    return <>
        <Text color={"green"}>🚀 开始导出 Git 日志</Text>
        {log && <Text>✅ 导出日志成功</Text>}
        {result && <>
            <Text>⚙️ 正在生成日志</Text>
            <Text color={"blue"}>{result}</Text>
        </>}
    </>
}
