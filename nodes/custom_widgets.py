"""
File    : custom_widgets.py
Purpose : Custom ComfyUI widgets implemented specifically for this project.
Author  : Martin Rizzo | <martinrizzo@gmail.com>
Date    : May 11, 2026
Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
License : MIT
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                          ComfyUI-ZImagePowerNodes
         ComfyUI nodes designed specifically for the "Z-Image" model.
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

  The custom types section in the V3 schema documentation can be found here:
   - https://docs.comfy.org/custom-nodes/v3_migration#custom-types

"""
from typing           import cast
from comfy_api.latest import io


#========================= PALETTE SELECTOR WIDGET =========================#

@io.comfytype(io_type="ZIPN_PALETTE_SELECTOR")
class PaletteSelector:
    #Type = str

    class Input(io.Input):

        def __init__(self,
                     id : str,
                     **kwargs
                     ):
            """
            <hr>A color palette selector widget.
            """
            extra_dict = {}
            super().__init__(id, extra_dict=extra_dict, **kwargs)



    class Output(io.Output):
        def __init__(self, **kwargs):
            super().__init__(**kwargs)



#========================== STYLE SELECTOR WIDGET ==========================#

@io.comfytype(io_type="ZIPN_STYLE_SELECTOR")
class StyleSelector:
    #Type = str

    class Input(io.Input):

        def __init__(self,
                     id : str,
                     **kwargs
                     ):
            """
            <hr>A separator widget.

            Args:
                id (str):                  A unique identifier for the input component.
                mode (str, optional):      The visual style of the separator `"spacer"`, `"divider"`, `"dotted"`, `"bold"`.
                                            Defaults to 'spacer'.
                color (str, optional):     The color of the separator. Accepts a hexadecimal color string.
                                            Defaults to '#555555'.
                height (int, optional):    The height of the separator. Defaults to `20`.
                thickness (int, optional): The thickness of the separator. Defaults to `2`.
            """
            ALLOWED_MODES = ("spacer", "divider", "dotted", "bold")
            extra_dict = {}

            # if mode is not None:
            #     if mode not in ALLOWED_MODES:
            #         raise ValueError(f"Invalid mode: {mode}. Must be one of {ALLOWED_MODES}")
            #     extra_dict["mode"] = mode

            super().__init__(id, extra_dict=extra_dict, **kwargs)



    class Output(io.Output):
        def __init__(self, **kwargs):
            super().__init__(**kwargs)




#============================ SEPARATOR WIDGET =============================#

@io.comfytype(io_type="ZIPN_SEPARATOR")
class Separator:
    #Type = str

    class Input(io.Input):

        def __init__(self,
                     id       : str,
                     mode     : str | None = None,
                     color    : str | None = None,
                     height   : int | None = None,
                     thickness: int | None = None,
                     **kwargs
                     ):
            """
            <hr>A separator widget.

            Args:
                id (str):                  A unique identifier for the input component.
                mode (str, optional):      The visual style of the separator `"spacer"`, `"divider"`, `"dotted"`, `"bold"`.
                                            Defaults to 'spacer'.
                color (str, optional):     The color of the separator. Accepts a hexadecimal color string.
                                            Defaults to '#555555'.
                height (int, optional):    The height of the separator. Defaults to `20`.
                thickness (int, optional): The thickness of the separator. Defaults to `2`.
            """
            ALLOWED_MODES = ("spacer", "divider", "dotted", "bold")
            extra_dict = {}

            if mode is not None:
                if mode not in ALLOWED_MODES:
                    raise ValueError(f"Invalid mode: {mode}. Must be one of {ALLOWED_MODES}")
                extra_dict["mode"] = mode

            if color is not None:
                extra_dict["color"] = color

            if height is not None:
                extra_dict["height"] = height

            if thickness is not None:
                extra_dict["thickness"] = thickness

            super().__init__(id, extra_dict=extra_dict, **kwargs)



    class Output(io.Output):
        def __init__(self, **kwargs):
            super().__init__(**kwargs)


#==================== STYLE GALLERY BUTTON [DEPRECATED] ====================#

@io.comfytype(io_type="ZIPN_STYLE_GALLERY_BUTTON")
class StyleGalleryButton:
    #Type = str

    class Input(io.Input):

        def __init__(self,
                     id     : str,
                     tooltip: str | None = None,
                     version: str | None = None,
                     ):
            """
            <hr>A button that launches the style gallery.

            The selected style by the user within the style gallery
            will be applied to the combobox immediately above this button.

            Args:
                id (str):                A unique identifier for the input component.
                version (str, optional): The version of the visual styles to display in the
                                         style gallery. This parameter can be used for backwards
                                         compatibility with older versions of the styles. If not
                                         provided, the latest version will be used.
            """
            extra_dict = {}

            if version is not None:
                extra_dict["version"] = version

            super().__init__(id, extra_dict=extra_dict, tooltip=cast(str, tooltip))



