"""
File    : zsampler_turbo.py
Purpose : Node for denoising latent images using a set of custom sigmas with Z-Image Turbo (ZIT)
Author  : Martin Rizzo | <martinrizzo@gmail.com>
Date    : Jan 16, 2026
Repo    : https://github.com/martin-rizzo/ComfyUI-ZImageNodes
License : MIT
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                              ComfyUI-ZImageNodes
             Experimental ComfyUI nodes for the Z-Image model.
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

    The V3 schema documentation can be found here:
    - https://docs.comfy.org/custom-nodes/v3_migration

"""
import torch
import comfy.utils
import comfy.sample
import comfy.samplers
import comfy.nested_tensor
import latent_preview
from comfy_api.latest import io
from .core.system     import logger


class ZSamplerTurbo(io.ComfyNode):
    xTITLE         = "ZSampler Turbo"
    xCATEGORY      = None
    xCOMFY_NODE_ID = None
    xDEPRECATED    = None

    #__ INPUT / OUTPUT ____________________________________
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            display_name  = cls.xTITLE,
            category      = cls.xCATEGORY,
            node_id       = cls.xCOMFY_NODE_ID,
            is_deprecated = cls.xDEPRECATED,
            inputs=[
                io.Model.Input       ("model"       , tooltip="The model used for generating the latent images."),
                io.Conditioning.Input("positive"    , tooltip="The conditional text prompts to embed in the latent image."),
                io.Latent.Input      ("latent_input", tooltip="The latent image to denoise."),
                io.Int.Input         ("seed"        , tooltip="The seed to use for the random number generator."),
            ],
            outputs=[
                io.Latent.Output(display_name="latent_output", tooltip="The latent image after denoising."),
            ]
        )

    #__ FUNCTION __________________________________________
    @classmethod
    def execute(cls, model, positive, latent_input, seed) -> io.NodeOutput:
        sampler = comfy.samplers.sampler_object("euler")
        latent_input , _ = cls.execute_sampler_custom(model, True , seed, 1.0, positive, positive, sampler, [0.991, 0.98, 0.92], latent_input)
        latent_input , _ = cls.execute_sampler_custom(model, False, seed, 1.0, positive, positive, sampler, [0.935, 0.90, 0.875, 0.750, 0.0000], latent_input)
        latent_output, _ = cls.execute_sampler_custom(model, True , 696969, 1.0, positive, positive, sampler, [0.6582, 0.4556, 0.2000, 0.0000], latent_input)
        return io.NodeOutput(latent_output)


    @classmethod
    def execute_sampler_custom(cls,
                               model,
                               add_noise,
                               noise_seed,
                               cfg,
                               positive,
                               negative,
                               sampler,
                               sigmas,
                               latent_image
                               ) -> io.NodeOutput:

            # if sigmas is a list then convert it to pytorch tensor
            if isinstance(sigmas, list):
                samples = latent_image["samples"]
                sigmas = torch.tensor(sigmas, device='cpu')
                #.to(samples.device)

            # generate a copy of the latent and at the same time fix empty channels
            latent = latent_image
            latent_image = latent["samples"]
            latent = latent.copy()
            latent_image = comfy.sample.fix_empty_latent_channels(model, latent_image)
            latent["samples"] = latent_image

            if not add_noise:
                samples = latent["samples"]
                noise   = torch.zeros(samples.shape, dtype=samples.dtype, layout=samples.layout, device="cpu")
            else:
                samples = latent["samples"]
                noise   = comfy.sample.prepare_noise(samples, noise_seed, latent.get("batch_index"))

            noise_mask = None
            if "noise_mask" in latent:
                noise_mask = latent["noise_mask"]

            x0_output = {}
            callback = latent_preview.prepare_callback(model, sigmas.shape[-1] - 1, x0_output)

            disable_pbar = not comfy.utils.PROGRESS_BAR_ENABLED
            samples = comfy.sample.sample_custom(model, noise, cfg, sampler, sigmas, positive, negative, latent_image, noise_mask=noise_mask, callback=callback, disable_pbar=disable_pbar, seed=noise_seed)

            out = latent.copy()
            out["samples"] = samples
            if "x0" in x0_output:
                x0_out = model.model.process_latent_out(x0_output["x0"].cpu())
                if samples.is_nested:
                    latent_shapes = [x.shape for x in samples.unbind()]
                    x0_out = comfy.nested_tensor.NestedTensor(comfy.utils.unpack_latents(x0_out, latent_shapes))
                out_denoised = latent.copy()
                out_denoised["samples"] = x0_out
            else:
                out_denoised = out

            return (out, out_denoised)

