"""
File    : my_top_10_styles.py
Purpose : Node that shows the user personal top 10 styles to select from.
Author  : Martin Rizzo | <martinrizzo@gmail.com>
Date    : Jan 31, 2026
Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
License : MIT
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                          ComfyUI-ZImagePowerNodes
         ComfyUI nodes designed specifically for the "Z-Image" model.
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

The V3 schema documentation can be found here:
 - https://docs.comfy.org/custom-nodes/v3_migration

"""
from comfy_api.latest           import io



class MyTop10Styles(io.ComfyNode):
    xTITLE         = "My Top 10 Styles"
    xCATEGORY      = ""
    xCOMFY_NODE_ID = ""
    xDEPRECATED    = False

    #__ INPUT / OUTPUT ____________________________________
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            display_name  = cls.xTITLE,
            category      = cls.xCATEGORY,
            node_id       = cls.xCOMFY_NODE_ID,
            is_deprecated = cls.xDEPRECATED,
            description   = (
                "Allows you to select a style from your personal top 10 styles and apply it to your prompt."
            ),
            inputs=[
                io.Boolean.Input( "a", default=True,),
                io.Boolean.Input( "b", default=True,),
                io.Boolean.Input( "c", default=True,),
                io.Boolean.Input( "d", default=True,),
                io.Boolean.Input( "e", default=True,),
                io.Boolean.Input( "f", default=True,),
                io.Boolean.Input( "g", default=True,),
                io.Boolean.Input( "h", default=True,),
                io.Boolean.Input( "i", default=True,),
                io.Boolean.Input( "j", default=True,),
            ],
            outputs=[
                io.String.Output(tooltip="The prompt after applying the selected style."),
            ]
        )

    #__ FUNCTION __________________________________________
    @classmethod
    def execute(cls, **kwargs) -> io.NodeOutput:

        prompt = str(kwargs)
        return io.NodeOutput( prompt )


    #__ VALIDATION ________________________________________
    @classmethod
    def validate_inputs(cls, **kwargs) -> bool | str:
        #if kwargs["category"] not in cls.category_names():
        #    return f"The category name '{kwargs['style_type']}' is invalid. May be the node is from an older version."
        return True


