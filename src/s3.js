const AWS = require('aws-sdk')
const fs = require('fs')
const { getuid } = require('process')
require('dotenv').config()

const ID = process.env.ACCESSKEYID
const SECRET = process.env.SECRETACCESSKEY
const BUCKET_ROOT = 'px-ad-img'

const s3 = new AWS.S3({
	accessKeyId: ID,
	secretAccessKey: SECRET,
	region: process.env.REGION,
})

const createBucket = (bucket_name) => {
	const bucketFolder = `${BUCKET_ROOT}/${bucket_name}/`
	const params = {
		Bucket: bucketFolder,
		CreateBucketConfiguration: {
			LocationConstraint: process.env.REGION,
		},
	}
	s3.headBucket({ Bucket: bucketFolder }, (err, data) => {
		if (err) {
			s3.createBucket(params, (err, data) => {
				if (err) throw err
				console.log('Bucket Created Successfully', data.Location)
			})
		} else {
			console.log('Bucket exists and we have access')
		}
	})
}

const uploadFile = (filename) => {
	const fileContent = fs.readFileSync(filename)
	console.log(fileContent)

	// const params = {
	// 	Bucket: BUCKET_ROOT,
	// 	Key: 'test-image.jpg',
	// 	Body: fileContent,
	// }

	// s3.upload(params, (err, data) => {
	// 	if (err) throw err
	// 	console.log(`File uploaded successfully. ${data.Location}`)
	// })
}
const getUrl = async () => {
	const uploadUrl = await s3.getSignedUrl('putObject', {
		Bucket: BUCKET_ROOT,
		Key: 'test-image.jpg',
	})
	console.log(uploadUrl)
}
// uploadFile('./public/kitaakabane_C2_1200x628_200814.jpg')
// createBucket('test')
getUrl()
