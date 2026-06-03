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
                     id              : str, *,
                     version         : str | None = None,
                     height          : int | None = None,
                     dialog_title    : str | None = None,
                     dialog_size     : str | None = None,
                     dialog_view_mode: str | None = None,
                     tooltip         : str | None = None,
                     ):
            """
            <hr>A color palette selector widget.
            Args:
                id (str):               A unique identifier for the input component.
                dialog_title (str):     The title of the dialog window that will be displayed to select the palette.
                dialog_size (str):      The size of the dialog window. Can be either "small" or "default"
                dialog_view_mode (str): The view mode for the dialog window. Can be either "grid" or "list".
                                        If provided, the user cannot change the view mode.
            """
            ALLOWED_DIALOG_SIZES = ("small", "default")
            ALLOWED_DIALOG_VIEW_MODES = ("grid", "list")
            if not dialog_title:
                dialog_title = "Select Palette"

            extra_dict = {}

            if version is not None:
                extra_dict["version"] = version

            if height is not None:
                extra_dict["height"] = height

            if dialog_title is not None:
                extra_dict["dialog_title"] = dialog_title

            if dialog_size is not None:
                extra_dict["dialog_size"] = dialog_size
                if dialog_size not in ALLOWED_DIALOG_SIZES:
                    raise ValueError(f"Invalid dialog size '{dialog_size}'. Allowed values are {ALLOWED_DIALOG_SIZES}")

            if dialog_view_mode is not None:
                extra_dict["dialog_view_mode"] = dialog_view_mode
                if dialog_view_mode not in ALLOWED_DIALOG_VIEW_MODES:
                    raise ValueError(f"Invalid dialog view '{dialog_view_mode}'. Allowed values are {ALLOWED_DIALOG_VIEW_MODES}")

            super().__init__(id, extra_dict=extra_dict, tooltip=cast(str, tooltip))


    class Output(io.Output):
        def __init__(self, **kwargs):
            super().__init__(**kwargs)



#========================== STYLE SELECTOR WIDGET ==========================#
#Type = str

@io.comfytype(io_type="ZIPN_STYLE_SELECTOR")
class StyleSelector:

    class Input(io.Input):

        def __init__(self,
                     id              : str, *,
                     version         : str | None = None,
                     height          : int | None = None,
                     dialog_title    : str | None = None,
                     dialog_size     : str | None = None,
                     dialog_view_mode: str | None = None,
                     tooltip         : str | None = None,
                     ):
            """
            <hr>A visual style selector widget.
            Args:
                id (str):               A unique identifier for the input component.
                dialog_title (str):     The title of the dialog window that will be displayed to select the style.
                dialog_size (str):      The size of the dialog window. Can be either "small" or "default"
                dialog_view_mode (str): The view mode for the dialog window. Can be either "grid" or "list".
                                        If provided, the user cannot change the view mode.
            """
            ALLOWED_DIALOG_SIZES = ("small", "default")
            ALLOWED_DIALOG_VIEW_MODES = ("grid", "list")
            if not dialog_title:
                dialog_title = "Select Style"

            extra_dict = {}

            if version is not None:
                extra_dict["version"] = version

            if height is not None:
                extra_dict["height"] = height

            if dialog_title is not None:
                extra_dict["dialog_title"] = dialog_title

            if dialog_size is not None:
                extra_dict["dialog_size"] = dialog_size
                if dialog_size not in ALLOWED_DIALOG_SIZES:
                    raise ValueError(f"Invalid dialog size '{dialog_size}'. Allowed values are {ALLOWED_DIALOG_SIZES}")

            if dialog_view_mode is not None:
                extra_dict["dialog_view_mode"] = dialog_view_mode
                if dialog_view_mode not in ALLOWED_DIALOG_VIEW_MODES:
                    raise ValueError(f"Invalid dialog view '{dialog_view_mode}'. Allowed values are {ALLOWED_DIALOG_VIEW_MODES}")

            super().__init__(id, extra_dict=extra_dict, tooltip=cast(str, tooltip))



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



