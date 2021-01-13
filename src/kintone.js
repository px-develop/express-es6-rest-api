import { KintoneRestAPIClient } from '@kintone/rest-api-client'
import * as dotenv from 'dotenv'
dotenv.config()

export default (callback) => {
	// connect to a database if needed, then pass it to `callback`:
	const client = new KintoneRestAPIClient({
		baseUrl: process.env.KINTONEURL,
		auth: {
			username: process.env.KINTONEUSER,
			password: process.env.KINTONEPSWD,
		},
	})
	callback(client)
}
