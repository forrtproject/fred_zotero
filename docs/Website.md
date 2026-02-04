# Zotero Replication Checker
A privacy-first Zotero 7 plugin that discovers replication studies for items in your library using the [FORRT Library of Reproduction and Replication Attempts (FLoRA)](https://forrt.org/replication-hub/). It scans your local library for DOIs, checks against FLoRA using privacy-preserving prefix matching, notifies you when reproductions and replications exist, and allows easy addition to your library — all without sending identifiable data off your machine.

This plugin was developed as a [FORRT](https://forrt.org/) project to build a working prototype for the open science community. It helps researchers discover replication studies by identifying items with known replications and unobtrusively notifying them via tags and notes. 

The development was funded by UKRI as part of the [Making Replications Count](https://forrt.org/marco/) project.  

## Features

- 🔍 **Privacy-preserving matching**: Uses hash prefixes to query the database without exposing your library contents
- 📚 **Batch processing**: Checks entire library, selected items, or collections in one operation
- 📖 **Read-only library support**: Automatically detects read-only group libraries and offers to copy originals and replications to your Personal library
- 🏷️ **Automatic tagging**: Adds contextual tags including "Has Replication", "Is Replication", and "Original present in Read-Only Library"
- 📝 **Detailed notes**: Creates child notes with replication details (title, authors, journal, outcome, DOI)
- 🔗 **Smart organization**: Creates separate collections for originals from read-only libraries and their replications
- 🔄 **Bidirectional linking**: Automatically links original studies with their replications as related items
- 🚫 **Blacklist management**: Ban unwanted replications from being re-added during future checks
- 🌍 **Multi-language support**: Available in English and German, with easy localization for additional languages
- ⚡ **Fast**: Efficient hash-based lookup with collision handling. 


For more information on usage and functionality, head to [Documentation](https://github.com/forrtproject/fred_zotero/blob/main/README.md).



**Currently available languages:**

- English (en-US) ✅
- German (de) ✅


## Feedback

Do you have feedback for us? Open an issue here if you encounter bugs or documentation issues. You can also [contact us anonymously about the Replication Checker](https://tinyurl.com/y5evebv9).