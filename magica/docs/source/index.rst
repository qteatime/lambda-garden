Welcome to Magica's documentation!
==================================

.. warning::

  Magica is still a work in progress, and so are these books. You should
  consider them unedited drafts. Magica has not reached a stable release
  yet, any any concept covered here might change in future versions.

The official documentation is divided into sections and books, and covers
different aspects of the technical and practical sides of Magica.


Embedding Magica
================

The primary distribution of Magica is as a virtual machine for a logic
database. You embed one of the Magica implementations in your program,
and feed programs in Magica's logic programming language for querying
the database.

:doc:`Embedding Magica <embedder-manual/index>`
  The embedder manual has everything you need to put some Magica in your
  programs.


Using Magica
============

As a user, you interact with a logical database by inserting or removing
facts from it, and querying those facts using a special programming language.

:doc:`Using Magica <user-manual/index>`
  The user manual has everything you need to use a Magica implementation.


Auditing Magica
===============

Magica subscribes to the same secure-by-design philosophy that Kate has,
and is thus designed on top of a more rigorous mathematical framework, as
well as having well-specified threat models.

:doc:`The tricks behind Magica <design/index>`
  The design manual has both formal specifications for the Magica components
  and threat model documents.


Changes, Terms, and Credits
===========================

Here you'll find when features are introduced or changed in Magica, as well
as the terms of use for different components of the project.

:doc:`Magica's release notes <etc/releases/index>`
  Release notes for all Magica versions can be read here.

:doc:`Licence <etc/licence>`
  Licence terms for Magica can be read here.


Indices and tables
==================

:ref:`General Index <genindex>`
   Quick access to all terms and sections.

:ref:`Module Index <modindex>`
   Quick access to API references for all modules.


.. toctree::
  :hidden:

  design/index