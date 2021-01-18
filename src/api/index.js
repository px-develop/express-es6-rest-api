import { version } from '../../package.json'
import { Router } from 'express'
// import facets from './facets';

import fs from 'fs'
import path from 'path'
import multer from 'multer'

const APPID = 1257
const BUCKET_ROOT = 'px-ad-img'

export default ({ config, client, s3 }) => {
	let api = Router()

	// perhaps expose some API metadata at the root
	api.get('/version', (req, res) => {
		res.json({ version })
	})

	// get project codes
	api.get('/records', (req, res, next) => {
		;(async () => {
			const params = {
				app: APPID,
				fields: ['プロジェクトコード', 'プロジェクトネーム', '企業名'],
			}
			const records = await client.record.getRecords(params)
			res.status(200).json(records)
		})().catch(next)
	})

	/**
	 * 一回ローカルに保存する？
	 * ミスない仕組み。。
	 * URL取得
	 * 後処理
	 * ダウンロード
	 */

	// upload single-file to S3
	api.post('/upload', (req, res, next) => {
		const upload = multer({
			storage: multer.diskStorage({
				destination: './temp',
				filename: (req, file, callback) => {
					callback(null, file.originalname)
				},
			}),
		}).array('uploadFile', 1)

		upload(req, res, (err) => {
			if (err) res.status(500).send({ message: 'Error uploading file.' })

			const fileContent = fs.readFileSync(path.resolve(req.files[0].path))
			const params = {
				Bucket: BUCKET_ROOT,
				Key: req.files[0].filename,
				Body: fileContent,
			}
			s3.upload(params, (err, data) => {
				if (err) throw err
				res.status(200).send({ url: data.Location })
			})
		})

		// const upload = multer({
		// 	storage: multerS3({
		// 		s3: s3,
		// 		bucket: BUCKET_ROOT,
		// 		metadata: (req, file, cb) => {
		// 			cb(null, { fieldName: file.fieldname })
		// 		},
		// 		key: (req, file, cb) => {
		// 			cb(null, Date.now() + file.originalname)
		// 		},
		// 		limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
		// 	}),
		// }).array('uploadFile', 1)

		// upload(req, res, (err) => {
		// 	if (err) {
		// 		res.status(500).json({ message: 'Error uploading file.' })
		// 	}
		// 	res.status(200).json({ message: 'File is uploaded' })
		// })

		/**middlewareをうまく使えればいける？？ */

		// // Parse FormData
		// const form = formidable({ mulitples: true })
		// form.parse(req, (err, fields, files) => {
		// 	if (err) res.status(400).json({ message: 'Bad Request' })
		// 	createBucket(fields.company)
		// })
		// // Check if bucket exists, and create if if it doesn't
		// const createBucket = (company) => {
		// 	const params = {
		// 		Bucket: BUCKET_ROOT,
		// 		Delimiter: '/',
		// 		Prefix: company,
		// 	}
		// 	s3.listObjects(params, (err, data) => {
		// 		// CommonPrefixesで判定できそうだがもっと上手いやり方がありそう。。
		// 		if (err) {
		// 			console.log(err)
		// 		} else {
		// 			if (data.CommonPrefixes.length > 0) {
		// 				console.log('Bucket found')
		// 			} else {
		// 				console.log('Bucket not found')
		// 				s3Upload(company)
		// 			}
		// 		}
		// 	})
		// }

		// const s3Upload = (company) => {
		// 	console.log('company', company)
		// 	const upload = multer({
		// 		storage: multerS3({
		// 			s3: s3,
		// 			bucket: BUCKET_ROOT,
		// 			metadata: (req, file, cb) => {
		// 				console.log(file)
		// 				cb(null, { fieldName: file.fieldname })
		// 			},
		// 			key: (req, file, cb) => {
		// 				console.log(`${company}/` + file.originalname)
		// 				cb(null, file.originalname)
		// 			},
		// 			limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
		// 		}),
		// 	}).array('uploadFile', 1)

		// 	upload(req, res, (err) => {
		// 		console.log('uploaded')
		// 		if (err) {
		// 			res.status(500).json({ message: 'Error uploading file.' })
		// 		}
		// 		res.status(200).json({ message: 'File is uploaded' })
		// 	})
		// }
	})

	return api
}
