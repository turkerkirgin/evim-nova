# Notices

## HaCasa Nova

Evim Nova is a modified version of [HaCasa Nova](https://github.com/damianeickhoff/HaCasa) 3.0.5 by Damian Eickhoff,
used under the MIT License (see [LICENSE](LICENSE)). Changes: Turkish translation, the Evim modules in `src/evim_*.js`
(alarm screen, appearance tab and themes, boiler / air-conditioner / markets cards, camera tab), the scenarios, floor
plan, map and news pages, edit-mode additions, a renamed element (`evim-nova`) and the Home Assistant packages,
blueprints, demo and docs in this repository.

## Example content

- Room photos in `docs/ornek-odalar/` are AI-generated examples, not photos of a real home. Free to use.
- Alarm sounds in `homeassistant/www/sesler/` are synthesised by `ses_uret.py` in the same folder. Free to use.
- Screenshots and the promo video show a made-up demo home (`dev/mock-evim.js`).

## Design

The look of HaCasa Nova (and so of Evim Nova) is based on [Homio](https://github.com/iamtherufus/Homio) by iamtherufus, used under the MIT License:

    MIT License

    Copyright (c) 2025 iamtherufus

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

## Lit

The bundled `dist/evim-nova.js` includes [Lit](https://lit.dev) (BSD-3-Clause, Google LLC). Its license notice is kept at the end of that file.
