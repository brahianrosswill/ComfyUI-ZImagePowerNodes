"""
File    : __init__.py
Purpose : Register the nodes for the ComfyUI-ZImageNodes project.
Author  : Martin Rizzo | <martinrizzo@gmail.com>
Date    : Jan 16, 2026
Repo    : https://github.com/martin-rizzo/ComfyUI-ZImageNodes
License : MIT
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                              ComfyUI-ZImageNodes
             Experimental ComfyUI nodes for the Z-Image model.

    Copyright (c) 2026 Martin Rizzo

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
"""
import os
_PROJECT_EMOJI = "⚡"
_PROJECT_MENU  = "Z-Image"
_PROJECT_ID    = "//ZImageNodes"

# initialize the project logger
from comfy.cli_args     import args
from .nodes.core.system import setup_logger
if os.getenv('ZIMAGE_NODES_DEBUG'):
    setup_logger(log_level="DEBUG", emoji=_PROJECT_EMOJI, name="ZI_NODES", use_stdout=args.log_stdout)
else:
    setup_logger(log_level=args.verbose, emoji=_PROJECT_EMOJI, name="ZI_NODES", use_stdout=args.log_stdout)

# import the newly initialized Z-Image Nodes logger
from .nodes.core.system import logger

# initialize variables used by ComfyUI to import the custom nodes
NODE_CLASS_MAPPINGS        = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]


#====================== Z-IMAGE NODES IMPORT PROCESS =======================#
_DEPRECATED = False

def _comfy_import_node(cls):
    global NODE_CLASS_MAPPINGS
    global NODE_DISPLAY_NAME_MAPPINGS

    class_name         = cls.__name__
    class_display_name = cls.TITLE
    class_category     = f"{_PROJECT_EMOJI}{_CATEGORY}"
    comfy_class_name   = f"{class_name} {_PROJECT_ID}"

    if class_name in NODE_CLASS_MAPPINGS:
        logger.warning(f"Node class {class_name} already exists, skipping import.")
        return

    if _DEPRECATED:
        cls.DEPRECATED = True
        class_display_name = class_display_name.replace("💪TB","")
        class_display_name = class_display_name.replace("| ","")
        class_display_name = f"❌{class_display_name} [Deprecated]"

    cls.CATEGORY = class_category
    NODE_CLASS_MAPPINGS[comfy_class_name]        = cls
    NODE_DISPLAY_NAME_MAPPINGS[comfy_class_name] = class_display_name


# [Z-Image]
_CATEGORY = f"{_PROJECT_MENU}"

#from .nodes.zsampler                                import ZSampler
#_comfy_import_node(ZSampler)



# [Z-Image/__deprecated]
# here are the deprecated nodes that have been kept for compatibility.
_CATEGORY   = f"{_PROJECT_MENU}/__deprecated"
_DEPRECATED = True



logger.info(f"Imported {len(NODE_CLASS_MAPPINGS)} nodes")

