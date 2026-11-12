import cloudinary from '../config/cloudinary.js';

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image file');
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'mern-ai-ecommerce',
      resource_type: 'image',
    });

    res.status(201).json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    next(error);
  }
};
