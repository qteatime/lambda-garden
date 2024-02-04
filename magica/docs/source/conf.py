# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'Magica'
copyright = '2024, Niini'
author = 'Niini'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = []

templates_path = ['_templates']
exclude_patterns = []



# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'furo'
html_static_path = ['_static']

html_css_files = [
  "css/custom.css"
]

html_theme_options = {
  "announcement": "Magica is a work in progress and may change at any time.",
  "source_repository": "https://github.com/qteatime/magica",
  "source_branch": "main",
  "source_directory": "docs/source"
}

pygments_style = "colorful"

python_display_short_literal_types = True
