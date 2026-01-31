"""
File    : my_top_10_styles_selector.py
Purpose : Node that allows the user to select a style from their personal top 10 styles.
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

class MyTop10StylesSelector(io.ComfyNode):
    xTITLE         = "My Top-10 Styles Selector"
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
                io.Custom("style_name_list").Input( "top_styles"),
                io.Boolean.Input( "style_1" , default=True,),
                io.Boolean.Input( "style_2" , default=True,),
                io.Boolean.Input( "style_3" , default=True,),
                io.Boolean.Input( "style_4" , default=True,),
                io.Boolean.Input( "style_5" , default=True,),
                io.Boolean.Input( "style_6" , default=True,),
                io.Boolean.Input( "style_7" , default=True,),
                io.Boolean.Input( "style_8" , default=True,),
                io.Boolean.Input( "style_9" , default=True,),
                io.Boolean.Input( "style_10", default=True,),
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


