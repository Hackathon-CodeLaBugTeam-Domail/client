import Document from 'next/document'
import Head from 'next/head'
import Html from 'next/document'
import Main from 'next/document'
import NextScript from 'next/document'

class MyDocument extends Document {
	render() {
		return (
			<Html lang="en">
				<Head>
					<meta charSet="utf-8" />
					<meta charSet="utf-8" />
					<meta name="author" content="Code La Bug" />
					<meta name="description" content="Domail app" />
					<meta
						name="description"
						content="Domain, React + Next Js App , Code La Bug Team"
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
					{/* // for add Portal */}
					<div id="backdrop--root" />
					<div id="modal--overlay--root" />
				</body>
			</Html>
		)
	}
}

export default MyDocument
