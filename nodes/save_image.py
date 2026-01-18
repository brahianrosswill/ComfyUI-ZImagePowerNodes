"""
File    : save_image.py
Purpose : Node for saving a generated images to disk injecting CivitAI compatible metadata.
Author  : Martin Rizzo | <martinrizzo@gmail.com>
Date    : Jan 18, 2026
Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
License : MIT
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                          ComfyUI-ZImagePowerNodes
         ComfyUI nodes designed specifically for the "Z-Image" model.
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

    The V3 schema documentation can be found here:
    - https://docs.comfy.org/custom-nodes/v3_migration

"""
import os
import time
import json
import numpy as np
import torch
import folder_paths
from PIL                 import Image
from PIL.PngImagePlugin  import PngInfo
from comfy_api.latest    import io


class SaveImage(io.ComfyNode):
    xTITLE         = "Save Image"
    xCATEGORY      = ""
    xCOMFY_NODE_ID = ""
    xDEPRECATED    = False

    # these were instance variables
    # but now in V3 schema everything is @classmethod
    xTYPE          = "output"
    xCOMPRESS_LVL  = 4  # 4 when xType == "output", otherwise 0
    xEXTRA_PREFIX  = ""
    xOUTPUT_DIR    = ""

    #__ INPUT / OUTPUT ____________________________________
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            display_name   = cls.xTITLE,
            category       = cls.xCATEGORY,
            node_id        = cls.xCOMFY_NODE_ID,
            is_deprecated  = cls.xDEPRECATED,
            is_output_node = True,
            description    = (
                ""
            ),
            inputs=[
                io.Image.Input  ("images",
                                 tooltip="The images to save.",
                                ),
                io.String.Input ("filename_prefix", default="ZImage",
                                 tooltip="The prefix for the file to save. This may include formatting information such as %date:yyyy-MM-dd% or %Empty Latent Image.width% to include values from nodes",
                                ),
                io.Boolean.Input("covitai_compatible", default=True,
                                 tooltip="Whether to save the image in a CivitAI compatible format. If checked, this will modify the metadata to be compatible with CivitAI.",
                                ),
            ],
            hidden=[
                io.Hidden.prompt,
                io.Hidden.extra_pnginfo,
            ]
        )

    #__ FUNCTION __________________________________________
    @classmethod
    def execute(cls, images, filename_prefix: str, covitai_compatible: bool):

        images        = cls.normalize_images(images)
        image_width   = images[0].shape[1]
        image_height  = images[0].shape[0]
        prompt        = cls.hidden.prompt
        extra_pnginfo = cls.hidden.extra_pnginfo
        workflow      = extra_pnginfo.get("workflow") if extra_pnginfo else None
        output_dir    = cls.xOUTPUT_DIR if cls.xOUTPUT_DIR else folder_paths.get_output_directory()

        # solve the `filename_prefix`` entered by the user and get the full path
        filename_prefix = \
            cls.solve_filename_variables( f"{filename_prefix}{cls.xEXTRA_PREFIX}" )
        full_output_folder, name, counter, subfolder, filename_prefix \
            = folder_paths.get_save_image_path(filename_prefix,
                                               output_dir,
                                               image_width,
                                               image_height
                                               )

        # create PNG info containing ComfyUI metadata (+CivitAI injection)
        pnginfo = PngInfo()

        if prompt:
            prompt_json = json.dumps(prompt)
            pnginfo.add_text("prompt", prompt_json)

        if workflow:
            workflow_json = json.dumps(workflow)
            pnginfo.add_text("workflow", workflow_json)

        if extra_pnginfo:
            for info_name, info_dict in extra_pnginfo.items():
                if info_name not in ("parameters", "prompt", "workflow"):
                    pnginfo.add_text(info_name, json.dumps(info_dict))


        image_locations = []
        for batch_number, image in enumerate(images):
            batch_name = name.replace("%batch_num%", str(batch_number))

            # convert to PIL Image
            image = np.clip( image.numpy(force=True) * 255, 0, 255 ) # <- numpy
            image = Image.fromarray( image.astype(np.uint8) )        # <- PIL

            # generate the full file path to save the image
            filename  = f"{batch_name}_{counter+batch_number:05}_.png"
            file_path =  os.path.join(full_output_folder, filename)

            image.save(file_path,
                       pnginfo        = pnginfo,
                       compress_level = cls.xCOMPRESS_LVL)
            image_locations.append({"filename" : filename,
                                    "subfolder": subfolder,
                                    "type"     : cls.xTYPE
                                    })

        return { "ui": { "images": image_locations } }



    #__ internal functions ________________________________


    @classmethod
    def solve_filename_variables(cls,
                                 filename : str,
                                 ) -> str:
        """
        Solve the filename variables and return a string containing the solved filename.
        Args:
            filename    : The filename to solve.
            genparams   : A GenParams dictionary containing all the generation parameters.
        """
        now: time.struct_time = time.localtime()

        def get_var_value(name: str) -> str | None:
                """Returns the value for a given variable name or None if the variable name is not defined."""
                case_name = name
                name      = case_name.lower()
                if name == "":
                    return "%"
                # try to resolve time variables
                elif name == "year"  : return str(now.tm_year)
                elif name == "month" : return str(now.tm_mon ).zfill(2)
                elif name == "day"   : return str(now.tm_mday).zfill(2)
                elif name == "hour"  : return str(now.tm_hour).zfill(2)
                elif name == "minute": return str(now.tm_min ).zfill(2)
                elif name == "second": return str(now.tm_sec ).zfill(2)
                # try to resolve full date variable
                elif name.startswith("date:"):
                    value = case_name[5:]
                    value = cls.ireplace(value, "yyyy", str(now.tm_year))
                    value = cls.ireplace(value, "yy"  , str(now.tm_year)[-2:])
                    value = value.replace(  "MM"  , str(now.tm_mon ).zfill(2))
                    value = cls.ireplace(value, "dd"  , str(now.tm_mday).zfill(2))
                    value = cls.ireplace(value, "hh"  , str(now.tm_hour).zfill(2))
                    value = value.replace(  "mm"  , str(now.tm_min ).zfill(2))
                    value = cls.ireplace(value, "ss"  , str(now.tm_sec ).zfill(2))
                    return value
                #elif name in extra_vars:
                #    value = str(extra_vars[name])[:16]
                return None

        output = ""
        next_token_is_var = False
        for token in filename.split("%"):
            current_token_is_var = next_token_is_var
            last_token_was_text  = current_token_is_var

            # if the token contains spaces then it's not a variable name
            if ' ' in token:
                current_token_is_var = False

            var_value = get_var_value(token) if current_token_is_var else None
            if var_value is not None:
                # current token is a variable and the next token is text
                output += var_value
                next_token_is_var = False
            else:
                # current token is text, and the next token could be a variable
                output += ("%" if last_token_was_text else "") + token
                next_token_is_var = True

        return output



    @staticmethod
    def normalize_images(images: torch.Tensor,
                        /,*,
                        max_channels  : int        = 3,
                        max_batch_size: int | None = None,
                        ) -> torch.Tensor:
        """
        Normalizes a batch of images to default ComfyUI format.

        This function ensures that the input image tensor has a consistent shape
        of [batch_size, height, width, channels].

        Args:
            images           (Tensor): A tensor representing a batch of images.
            max_channels   (optional): The maximum number of color channels allowed. Defaults to 3.
            max_batch_size (optional): The maximum batch size allowed. Defaults to None (no limit).
        Returns:
            A normalized image tensor with shape [batch_size, height, width, channels].
        """
        images_dimension = len(images.shape)

        # if 'images' is a single image, add a batch_size dimension to it
        if images_dimension == 3:
            images = images.unsqueeze(0)

        # if 'images' has more than 4 dimensions,
        # colapse the extra dimensions into the batch_size dimension
        if images_dimension > 4:
            images = images.reshape(-1, *images.shape[-3:])

        if (max_channels is not None) and images.shape[-1] > max_channels:
            images = images[ : , : , : , 0:max_channels ]

        if (max_batch_size is not None) and images.shape[0] > max_batch_size:
            images = images[ 0:max_batch_size , : , : , : ]

        return images



    @staticmethod
    def ireplace(text: str, old: str, new: str, count: int = -1) -> str:
        """
        Replaces all occurrences of `old` in `text` with `new`, case-insensitive.
        If count is given, only the first `count` occurrences are replaced.
        """
        lower_text , lower_old = text.lower(), old.lower()
        index_start, index_end = 0, lower_text.find(lower_old, 0)
        if index_end == -1 or len(lower_text) != len(text):
            return text

        output = ""
        lower_old_length = len(lower_old)
        while index_end != -1 and count != 0:
            output += text[index_start:index_end] + new
            index_start = index_end + lower_old_length
            index_end   = lower_text.find(lower_old, index_start)
            if count > 0:
                count -= 1
        return output + text[index_start:]

