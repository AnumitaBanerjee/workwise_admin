import Joi from 'joi';
import { encode } from 'html-entities';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Config from '../../config/app.config.js';
import userModel from '../../models/userModel.js';
import { logError, currentDateTime, titleToSlug } from '../../helper/common.js';

var store_profile_images = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, Config.upload.user_image);
  },
  filename: function (req, file, callback) {
    var extention = path.extname(file.originalname);
    var new_file_name = +new Date() + '-' + uuidv4() + extention;
    callback(null, new_file_name);
  }
});
var store_agent_profile_images = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, Config.upload.agent_user_image);
  },
  filename: function (req, file, callback) {
    var extention = path.extname(file.originalname);
    var new_file_name = +new Date() + '-' + uuidv4() + extention;
    callback(null, new_file_name);
  }
});

var store_document = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, Config.upload.user_document);
  },
  filename: function (req, file, callback) {
    var extention = path.extname(file.originalname);
    var new_file_name = +new Date() + '-' + uuidv4() + extention;
    callback(null, new_file_name);
  }
});

var validatingImage = (schema) => {
  return (req, res, next) => {
    const result = Joi.validate(req.body, schema, {
      abortEarly: false
    });
    if (result.error) {
      let err_msg = {};
      for (let counter in result.error.details) {
        let k = result.error.details[counter].context.key;
        let val = result.error.details[counter].message;
        err_msg[k] = val;
      }
      let return_err = { status: 2, errors: err_msg };
      return res.status(400).json(return_err);
    }

    if (!req.value) {
      req.value = {};
    }
    req.value['body'] = result.value;
    return true;
  };
};

const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.validate(req.body, { abortEarly: false });

    if (result.error) {
      let err_msg = {};
      for (let counter in result.error.details) {
        let k = result.error.details[counter].context.key;
        let val = result.error.details[counter].message;
        err_msg[k] = val;
      }
      let return_err = { status: 2, errors: err_msg };
      return res.status(400).json(return_err);
    }

    if (!req.value) {
      req.value = {};
    }

    req.value['body'] = result.value;

    next();
  };
};
const validateParam = (schema) => {
  return (req, res, next) => {
    const result = schema.validate(req.params);
    if (result.error) {
      let return_err = { status: 2, errors: 'Invalid argument' };
      return res.status(400).json(return_err);
    }

    if (!req.value) {
      req.value = {};
    }
    req.value['params'] = result.value;
    next();
  };
};

const schemas = {
  id: Joi.object().keys({
    id: Joi.string()
      .required()
      .regex(/^[0-9]*$/, 'Please send proper id')
  }),
  approval: Joi.object().keys({
    status: Joi.string()
      .required()
      .regex(/^[0|1]$/, 'numeric values only'),
    reject_reason: Joi.string().trim().optional().allow(null, ''),
    reject_reason_id: Joi.string()
      .optional()
      .regex(/^\d+$/, 'numeric values only')
  }),
  other_user_register: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email().max(100),
    mobile: Joi.string().min(8).max(11).required().label('Mobile'),
    organization_name: Joi.string().min(4).required()
  }),
  other_user_register_update: Joi.object().keys({
    name: Joi.string().required(),
    mobile: Joi.string().min(8).max(11).required().label('Mobile'),
    organization_name: Joi.string().optional().allow(null).allow('')
  })
};

const schema_posts = {
  add_user_profile_image: async (req, res, next) => {
    try {
      var upload = multer({
        storage: store_profile_images,
        limits: {
          fileSize: 90000000 // Compliant: 8MB
        },
        fileFilter: (req, file, cb) => {
          var ext = path.extname(file.originalname).toLowerCase();

          if (ext == '.png' || ext == '.jpg' || ext == '.jpeg') {
            var validateImage = validatingImage(schemas.profile_image);
            if (validateImage) {
              cb(null, true);
            }
          } else {
            cb(null, false);
            return cb('Only .png, .jpg, .jpeg format allowed!', null);
          }
        }
      }).single('file');
      upload(req, res, async function (err) {
        if (err) {
          let data = {};
          data.file = err;
          res
            .status(400)
            .json({
              status: 2,
              errors: data
            })
            .end();
        } else {
          next();
        }
      });
    } catch (err) {
      console.log('====>', err);
      res.status(400).json({
        status: 3,
        message: 'server error'
      });
    }
  },
  add_other_user: async (req, res, next) => {
    try {
      let upload = multer({
        storage: store_profile_images,
        limits: {
          fileSize: 2000000 // Compliant: 8MB
        },
        fileFilter: (req, file, cb) => {
          let ext = path.extname(file.originalname).toLowerCase();

          if (
            ext == '.png' ||
            ext == '.jpg' ||
            ext == '.jpeg' ||
            ext == '.webp'
          ) {
            cb(null, true);
          } else {
            cb(null, false);
            return cb('Only .png, .jpg, .jpeg format allowed!', null);
          }
        }
      }).single('image');
      upload(req, res, async function (err) {
        if (err) {
          let data = {};
          data.file_name = err;
          res
            .status(400)
            .json({
              status: 2,
              message: data.file_name
            })
            .end();
        } else {
          const result = schemas.other_user_register.validate(req.body, {
            abortEarly: false
          });
          if (result.error) {
            let err_msg = {};
            for (let counter in result.error.details) {
              let k = result.error.details[counter].context.key;
              let val = result.error.details[counter].message;
              err_msg[k] = val;
            }
            let return_err = { status: 2, errors: err_msg };
            return res.status(400).json(return_err);
          } else {
            let error = {};
            let errCount = 0;
            if (errCount > 0) {
              res
                .status(400)
                .json({
                  status: 2,
                  errors: error
                })
                .end();
            } else {
              next();
            }
          }
        }
      });
    } catch (err) {
      logError(err);
      res.status(400).json({
        status: 3,
        message: 'server error'
      });
    }
  },
  add_other_user_update: async (req, res, next) => {
    try {
      let upload = multer({
        storage: store_profile_images,
        limits: {
          fileSize: 2000000 // Compliant: 8MB
        },
        fileFilter: (req, file, cb) => {
          let ext = path.extname(file.originalname).toLowerCase();

          if (
            ext == '.png' ||
            ext == '.jpg' ||
            ext == '.jpeg' ||
            ext == '.webp'
          ) {
            cb(null, true);
          } else {
            cb(null, false);
            return cb('Only .png, .jpg, .jpeg format allowed!', null);
          }
        }
      }).single('image');
      upload(req, res, async function (err) {
        if (err) {
          let data = {};
          data.file_name = err;
          res
            .status(400)
            .json({
              status: 2,
              message: data.file_name
            })
            .end();
        } else {
          const result = schemas.other_user_register_update.validate(req.body, {
            abortEarly: false
          });
          if (result.error) {
            let err_msg = {};
            for (let counter in result.error.details) {
              let k = result.error.details[counter].context.key;
              let val = result.error.details[counter].message;
              err_msg[k] = val;
            }
            let return_err = { status: 2, errors: err_msg };
            return res.status(400).json(return_err);
          } else {
            let error = {};
            let errCount = 0;
            if (errCount > 0) {
              res
                .status(400)
                .json({
                  status: 2,
                  errors: error
                })
                .end();
            } else {
              next();
            }
          }
        }
      });
    } catch (err) {
      logError(err);
      res.status(400).json({
        status: 3,
        message: 'server error'
      });
    }
  }
};

export { validateBody, validateParam, schemas, schema_posts };