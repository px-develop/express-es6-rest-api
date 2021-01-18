import { KintoneRestAPIClient } from '@kintone/rest-api-client'
import * as AWS from 'aws-sdk'
import * as dotenv from 'dotenv'
dotenv.config()

export const kintoneAuth = (callback) => {
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
export const s3Auth = (client, callback) => {
	const s3 = new AWS.S3({
		signatureVersion: 'v4',
		accessKeyId: process.env.ACCESSKEYID,
		secretAccessKey: process.env.SECRETACCESSKEY,
		region: process.env.REGION,
	})
	callback(client, s3)
}
