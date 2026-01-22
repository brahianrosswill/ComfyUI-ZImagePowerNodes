"""
File    : style_prompt_encoder.py
Purpose : Node to get conditioning embeddings from a given style + prompt.
Author  : Martin Rizzo | <martinrizzo@gmail.com>
Date    : Jan 16, 2026
Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
License : MIT
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                          ComfyUI-ZImagePowerNodes
         ComfyUI nodes designed specifically for the "Z-Image" model.
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

 ComfyUI V3 Schema oficial documentation:
 - https://docs.comfy.org/custom-nodes/v3_migration

"""
from comfy_api.latest           import io
from .core.system               import logger
from .styles.style_group        import StyleGroup, apply_style_to_prompt
from .styles.predefined_styles  import STYLE_GROUPS


class StylePromptEncoder(io.ComfyNode):
    xTITLE         = "Style & Prompt Encoder"
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
                "Transforms a text prompt into embeddings, automatically adapting the prompt to match "
                "the selected style. This node takes a prompt, adjusts its visual style according to "
                "the chosen option, and then encodes it using the provided text encoder (clip) to "
                "generate an embedding that will guide image generation."
            ),
            inputs=[
                io.Clip.Input  ("clip",
                                tooltip="The CLIP model used for encoding the text."
                               ),
                io.String.Input("customization", optional=True, multiline=True, force_input=True,
                                tooltip=(
                                  'An optional multi-line string to customize existing styles. '
                                  'Each style definition must start with ">>>" followed by the style name, and then include '
                                  'its description on the next lines. The description should incorporate "{$@}" where the '
                                  'main text prompt will be inserted.'),
                               ),
                io.Combo.Input ("category", options=cls.category_names(),
                                tooltip="The category of styles you want to select from.",
                               ),
                io.Combo.Input ("style_to_apply", options=cls.style_names(),
                                tooltip="The style you want for your image.",
                                extra_dict = { "extended_names": cls.style_extended_names() },
                               ),
                io.String.Input("text", multiline=True, dynamic_prompts=True,
                                tooltip="The prompt to encode.",
                               ),
            ],
            outputs=[
                io.Conditioning.Output(tooltip="The encoded text used to guide the image generation."),
                io.String.Output(tooltip="The prompt after applying the selected photographic style."),
            ]
        )

    #__ FUNCTION __________________________________________
    @classmethod
    def execute(cls, clip, category: str, style_to_apply: str, text: str, customization: str = "") -> io.NodeOutput:
        prompt        = text
        found_style   = None
        custom_styles = StyleGroup.from_string(customization)

        if isinstance(style_to_apply, str) and style_to_apply != "none":
            # first search inside the custom styles that the user has defined,
            # if not found, search inside the predefined styles
            found_style = custom_styles.get(style_to_apply)
            if not found_style:
                found_style = STYLE_GROUPS[0].get(style_to_apply)

        # if the style was found, apply it to the prompt
        if found_style:
            prompt = apply_style_to_prompt(prompt, found_style, spicy_impact_booster=False)

        if clip is None:
            raise RuntimeError("ERROR: clip input is invalid: None\n\nIf the clip is from a checkpoint loader node your checkpoint does not contain a valid clip or text encoder model.")
        tokens = clip.tokenize(prompt)
        return io.NodeOutput( clip.encode_from_tokens_scheduled(tokens), prompt )

    #__ VALIDATION ________________________________________
    @classmethod
    def validate_inputs(cls, **kwargs) -> bool | str:
        if kwargs["category"] not in cls.category_names():
            return f"The category name '{kwargs['category']}' is invalid. May be the node is from an older version."
        return True



    #__ internal functions ________________________________

    @classmethod
    def category_names(cls) -> list[str]:
        return ["illustration", "photo", "other"]

    @classmethod
    def style_names(cls) -> list[str]:
        return ["none"] + STYLE_GROUPS[0].get_style_names()


    @classmethod
    def style_extended_names(cls) -> list[str]:
        result = []
        for style_group in STYLE_GROUPS:
            result.extend( style_group.get_style_names_ex() )
        return result


