import React from 'react'

export default function LangSelect() {
    return (
        <div className='bg-zinc-900 text-white'>
            <select className='bg-zinc-900 text-white'>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="typescript">TypeScript</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
                <option value="scala">Scala</option>
                <option value="haskell">Haskell</option>
                <option value="lua">Lua</option>
                <option value="shell">Shell</option>
                <option value="sql">SQL</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
                <option value="yaml">YAML</option>
                <option value="markdown">Markdown</option>
                <option value="plaintext">Plain Text</option>
            </select>
            <div className="w-10">

            </div>
        </div>
    )
}