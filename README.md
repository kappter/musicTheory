Music Theory Modes Web Application
Overview
This web application visualizes music theory modes on a guitar fretboard and piano roll. It allows users to explore different musical modes (Ionian, Dorian, Phrygian, etc.) in various keys, with customizable notation (sharps or flats), guitar tuning, and string order. The app displays mode notes, intervals, chords, and emotional characteristics, with interactive controls for a dynamic learning experience.
Features

Interactive Controls:
Select key (e.g., C, G#, Bb) and mode (e.g., Ionian, Dorian).
Choose between sharp or flat notation.
Switch between standard and drop D guitar tuning.
Toggle guitar string order (high string bottom or low string bottom).
Customize the theme color with a color picker.


Visualizations:
Guitar fretboard showing mode notes across 12 frets.
Piano roll displaying two octaves (C3 to B4) with highlighted mode notes.
Dynamic labels for fretboard and piano roll (e.g., "Guitar Fretboard (C Ionian)").


Information Display:
Table listing mode notes, intervals, triads, four-note chords, five-note chords, six-note chords, and emotional characteristics.
Relative modes section showing equivalent note structures (e.g., C Ionian is the same as A Aeolian).


Responsive Design:
Adapts to different screen sizes, with optimized layouts for mobile devices.


Customizable Styling:
Theme color applies to highlights, labels, and table headers, with a smooth gradient background.



Prerequisites

A modern web browser (e.g., Chrome, Firefox, Safari, Edge).
No external libraries or dependencies are required, as the app uses vanilla HTML, CSS, and JavaScript.

Setup Instructions

Download or Clone the Repository:
Clone the repository or download the index.html file to your local machine.


Run the Application:
Open index.html in a web browser. No server setup is required, as the app runs entirely client-side.


Verify Functionality:
Ensure the fretboard and piano roll render correctly.
Test the controls (key, mode, notation, tuning, string order, color picker) to confirm dynamic updates.
Check responsiveness by resizing the browser or using mobile view in developer tools.



Usage

Select a Key and Mode:
Use the dropdown menus to choose a key (e.g., C, G#) and mode (e.g., Ionian, Phrygian).
The fretboard and piano roll will highlight the corresponding notes, and the table will update with mode details.


Customize Notation:
Switch between sharp and flat notation to display notes accordingly (e.g., C# vs. Db).


Adjust Guitar Settings:
Choose between standard (EADGBE) or drop D (DADGBE) tuning.
Toggle string order to display high strings at the bottom or top of the fretboard.


Change Theme Color:
Use the color picker to update the app’s theme, affecting highlights, labels, and table headers.


Explore Visuals and Data:
View mode notes on the guitar fretboard (12 frets, 6 strings) and piano roll (two octaves, C3 to B4).
Check the table for notes, intervals, chords, and emotional characteristics.
Read the relative modes section to understand equivalent scales (e.g., C Ionian = A Aeolian).


Responsive Testing:
Resize the browser or use a mobile device to verify that the layout adjusts for smaller screens.



File Structure

index.html: The main application file containing HTML, CSS, and JavaScript.
HTML: Defines the structure with controls, table, and canvas elements.
CSS: Styles the app with a dark theme, responsive design, and custom animations.
JavaScript: Handles logic for mode calculations, fretboard and piano roll rendering, and dynamic updates.



Technical Details

HTML5 Canvas: Used for rendering the guitar fretboard and piano roll.
Fretboard: Displays 6 strings and 12 frets, with mode notes highlighted as circles.
Piano Roll: Shows two octaves (14 white keys, 10 black keys), with all keys labeled and mode notes highlighted.


JavaScript Logic:
Generates mode data (notes, intervals, chords) based on selected key and mode.
Supports sharp/flat notation and guitar tuning variations.
Updates visuals and table dynamically when controls change.


CSS Features:
Uses CSS custom properties (--theme-color, --theme-color-rgb) for dynamic theming.
Includes media queries for responsive design on mobile devices.
Applies hover effects and shadows for visual polish.


Performance:
Optimized for client-side rendering with no external dependencies.
Canvas redraws are triggered only when necessary (e.g., key/mode changes).



Known Limitations

Canvas Sizing: The piano roll and fretboard have fixed maximum widths (800px), which may not scale perfectly on very large screens.
Text Readability: On very small screens, note labels on the piano roll may appear cramped. Adjust the canvas height or font size in the CSS if needed.
No Audio: The app is purely visual and does not include sound playback for notes or chords.

Future Improvements

Add octave numbers to piano key labels (e.g., C3, C4) for clarity.
Implement note highlighting animations for a more engaging experience.
Add tooltips or popups for chord details on hover.
Include an option to save user preferences (e.g., theme color, tuning) using local storage.

Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a feature branch (git checkout -b feature-name).
Make changes and test thoroughly.
Submit a pull request with a clear description of the changes.

License
This project is licensed under the MIT License. Feel free to use, modify, and distribute the code as needed.
Acknowledgments

Built with vanilla HTML, CSS, and JavaScript for simplicity and accessibility.
Inspired by music theory resources and interactive learning tools.
