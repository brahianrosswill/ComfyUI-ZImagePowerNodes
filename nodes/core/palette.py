"""
File    : palette.py
Purpose : Core classes for working with color palettes.
           `Palette`   : A class for storing information about a color palette.
           `PaletteSet`: A container for storing multiple palettes.
Author  : Martin Rizzo | <martinrizzo@gmail.com>
Date    : May 29, 2026
Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
License : MIT
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                          ComfyUI-ZImagePowerNodes
         ComfyUI nodes designed specifically for the "Z-Image" model.
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
"""
from __future__ import annotations
import re
from   typing   import Iterator
from   .system  import logger
type VersionTuple = tuple[int, int, int]

# Regex to validate basic Hex color format (e.g., #FFFFFF or #FFF)
_HEX_PATTERN = re.compile(r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")


#============================== Palette CLASS ==============================#

class Palette:
    """
    Represents a color palette with indexed and dictionary-like access.

    Attributes:
        name         : The name of the palette.
        version      :
        version_tuple:
    """
    def __init__(self,
                 name: str,
                 *,
                 configuration: str | list[str],
                 description  : str                = "",
                 tags         : str                = "",
                 version      : str | VersionTuple = (0, 0, 0),
                 ):
        self.name       : str            = name.strip()
        self.description: str            = description.strip()
        self.tags       : str            = tags
        self._colors    : dict[str, str] = {}
        self._keys      : list[str]      = []
        self._versiontup: VersionTuple   = (0, 0, 0)

        # convert version to tuple if necessary
        if isinstance(version,str):
            self._versiontup = Palette.make_version_tuple(version)
        elif isinstance(version, tuple) and len(version) == 3:
            self._versiontup = version
        else: raise ValueError("Invalid version format. Expected a string or a tuple of 3 integers.")

        # extract all text lines from configuration
        all_lines : list[str] = configuration.splitlines() if isinstance(configuration, str) else configuration

        # process content line by line,
        # adding color-name and hex-value to the list
        for line in all_lines:
            line = line.strip()
            if not line:
                pass
            elif ':' not in line:
                logger.warning(f'Invalid line format in ${name} palette. Expected "<color-name>: #hexvalue".')
            else:
                # split only on the first colon found
                parts = line.split(':', 1)
                name_part = parts[0].strip()
                hex_part  = parts[1].strip()
                if not hex_part.startswith('#'):
                    logger.warning(f'Invalid hex value in ${name} palette. Expected "#hexvalue".')
                else:
                    self.add_color(name_part, hex_part)


    @property
    def version(self) -> str:
        """Returns the version formatted as a semantic version string 'X.Y.Z'."""
        return '.'.join(map(str, self._versiontup))


    @property
    def version_tuple(self) -> VersionTuple:
        """Returns the version as a tuple of three integers."""
        return self._versiontup


    def add_color(self, name: str, hex_code: str) -> bool:
        """Adds a color to the palette if the hex code is valid."""
        name     = self._normalize_color_name(name)
        hex_code = self._normalize_hex_code(hex_code)
        if _HEX_PATTERN.match(hex_code):
            if name not in self._colors:
                self._keys.append(name)
            self._colors[name] = hex_code
            return True
        return False


    def names(self) -> list[str]:
        """Returns a list of all color names in the palette."""
        return self._keys


    def hexs(self) -> list[str]:
        """Returns a list of all HEX codes in the palette."""
        return [self._colors[name] for name in self._keys]


    def items(self) -> Iterator[tuple[str, str]]:
        """Yields pairs of (name, hex_code)."""
        for name in self._keys:
            yield name, self._colors[name]


    def __len__(self) -> int:
        """Returns the number of colors."""
        return len(self._keys)

    def __getitem__(self, index: int) -> tuple[str, str]:
        """Allows indexing like palette to get (name, hex)."""
        name = self._keys[index]
        return name, self._colors[name]

    def __repr__(self) -> str:
        return f"Palette(name={self.name!r}, colors_count={len(self)})"


    @staticmethod
    def make_version_tuple(version_str: str) -> VersionTuple:
        """
        Parses a version string into a tuple of three integers (major, minor, and patch).

        The version string can be in one of the following formats:
          - Compact format    : 'v20' or '81' which are interpreted as (2, 0, 0) and (8, 1, 0).
          - Traditional format: '2.0.4' or 'v8.1' which are interpreted as (2, 0, 4) and (8, 1, 0).
        The leading 'v' or 'V' character is optional and will be stripped from the string.

        Args:
            version_str (str): The version string to parse.
        Returns:
            VersionTuple: A tuple of three integers (X, Y, Z) representing
                          the major, minor, and patch versions.
                          Returns (0, 0, 0) if parsing fails.
        """
        if not isinstance(version_str, str) or not version_str:
            return (0, 0, 0)

        # remove leading 'v' or 'V' characters
        clean_str = version_str.strip().lstrip('vV')

        if '.' in clean_str:
            # split by '.' and convert to integers if possible
            # '1.2.3' -> ['1', '2', '3']
            digits = [int(p) for p in clean_str.split('.') if p.isdigit()]
        else:
            # for compact format, split into individual digits
            # '123' -> [1, 2, 3] || '92' -> [9, 2]
            digits = [int(char) for char in clean_str if char.isdigit()]

        # ensure there are at least three elements by padding with zeros and return
        digits = digits + [0, 0, 0]
        return (digits[0], digits[1], digits[2])


    @staticmethod
    def _normalize_color_name(name: str) -> str:
        """Normalize a color name to a standardized format."""
        return name.lower().strip()

    @staticmethod
    def _normalize_hex_code(hex_code: str) -> str:
        """Normalize a hex color code to a standardized format."""
        if hex_code.startswith('#'):
            return hex_code.upper()
        else:
           return '#' + hex_code.upper()





#============================ PaletteSet CLASS =============================#

class PaletteSet:
    """
    A container class for managing multiple Palette objects.
    """
    def __init__(self):
        self._palettes: dict[str, Palette] = {}


    @classmethod
    def from_string(cls,
                    string  : str,
                    version : str | tuple[int,int,int] = (0,0,0)
                    ) -> PaletteSet:
        """
        Create a new PaletteSet instance from a multi-line string palette definitions.
        Args:
           string: A multi-line string containing palette definitions.
        Returns:
           A new `PaletteSet` instance with palettes loaded from the provided string.
        """
        if not isinstance(string, str) or len(string) == 0:
            return cls()
        palette_set = cls()
        palette_set.add_palettes_from_string(string, version=version)
        return palette_set



    def add_palettes_from_string(self,
                                 string : str | list[str],
                                 /,*,
                                 version  : str | VersionTuple = (0,0,0),
                                 ) -> int:
        """
        Parses palette definitions from a multi-line string and adds them into the palette set.

        This method scans the input string for special marker prefixes that
        delimit palette definitions.

        Marker Reference:
            ">>>" - Palette definition marker.
                    Indicates the start of a new palette. Everything that follows
                    (lines, blank lines, etc.) belongs to this palette's definition
                    until another palette marker is encountered.
                    The text inmediately after ">>>" becomes the palette name.
                    Example: ">>>Desert Sands" -> creates a palette named "Desert Sands"
            ">##" - Comment/Metadata marker.
                    All lines that start with ">##" are treated as comments unless
                    they contain a metadata definition (e.g., @DESCRIPTION).
            "@"   - File identifier (must be the first line of the input string).
                    The identifier line is ignored during parsing.
                    Example: "@PALETTES"

        Automatic Fallback Behavior:
            If the input string contains NO ">>>" markers, the entire string is
            treated as a single palette called "Custom 1".

        Args:
            string  : The input string (or list of lines) containing palette definitions.
            version : Default version assigned to palettes that do not specify one.
        Returns:
            The total number of palettes that were successfully parsed and added
            to the palette set. Returns 0 if the string was empty or contained
            no valid palette definitions.

        Example:
            >>> input_text = '''
            ... @PALETTES
            ...
            ... >>>Ocean Breeze
            ... azure  : #00FFFF
            ... cyan   : #87CEEB
            ... navy   : #000080
            ...
            ... >>>Sunset Glow
            ... gold   : #FFD700
            ... coral  : #FF7F50
            ... crimson: #DC143C
            ...
            >>> palette_set = PaletteSet()
            >>> count       = palette_set.add_palettes_from_string(input_text)
            # Loads 2 palettes: "Ocean Breeze" and "Sunset Glow"
        """
        all_lines : list[str] = string.strip().splitlines() if isinstance(string,str) else string

        # skip file identifier line if present (must be the first line)
        if all_lines and all_lines[0].startswith("@"):
            all_lines.pop(0)

        # if the input string does not contain any explicit palette definitions (>>>),
        # it is assumed to be plain text and automatically assigned to a default
        # palette "Custom 1".
        if not any(line.startswith(">>>") for line in all_lines):
            all_lines.insert(0, ">>>Custom 1")

        # add sentinel element to force processing of last palette
        all_lines.append(">>>EOF")

        load_count     : int       = 0
        pending_marker : str       = ""
        pending_content: list[str] = []
        pending_descrip: str       = ""
        pending_version: str | VersionTuple = version

        for line in all_lines:
            line = line.rstrip()  #< trailing whitespaces are lost at the end of each line

            # if the line is a comment, skip it
            if line.startswith(">##"):
                if ':' not in line:
                    continue
                param, _, value = line[3:].partition(":")
                param = param.strip().upper()
                if param == "@DESCRIPTION":
                    pending_descrip = value

            # when a new palette marker is detected,
            # the previous pending palette/content must be processed
            elif line.startswith(">>>"):
                if pending_marker:
                    palette = Palette(pending_marker[3:],
                                      configuration = pending_content,
                                      description   = pending_descrip,
                                      version       = pending_version)
                    if self.add_palette(palette):
                        load_count += 1

                # reset values to default
                pending_marker  = line
                pending_content = []
                pending_descrip = ""
                pending_version = version

            # the line does not contain any marker,
            # it is text that must be added to the pending content
            else:
                pending_content.append(line)

        return load_count



    def add_palette(self, palette: Palette) -> bool:
        """Adds a Palette instance to the set."""
        self._palettes[palette.name.lower()] = palette
        return True

    def get(self, name: str) -> Palette | None:
        """Retrieves a palette by name."""
        return self._palettes.get(name.lower())

    def __iter__(self) -> Iterator[Palette]:
        """Allows iteration over the palettes."""
        return iter(self._palettes.values())

    def __len__(self) -> int:
        """Returns the number of palettes in the set."""
        return len(self._palettes)

    def __repr__(self) -> str:
        """Provides a string representation of the PaletteSet instance."""
        palette_names = list(self._palettes.keys())
        return f"PaletteSet(palettes={palette_names})"

