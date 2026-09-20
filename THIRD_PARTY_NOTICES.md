# Third-party and asset notices

## Dethink code

The component and recipe code, tooling, and documentation are distributed under
the [MIT License](LICENSE). Keep the full notice with copies or substantial
portions. Registry installs include it at `components/dethink/LICENSE`; the
component package includes the same notice.

## Dependencies

Third-party packages retain their respective copyrights and licenses. The Dethink
MIT license does not replace those terms. Consult the license and notice files
in the installed packages for the versions you distribute, including transitive
dependencies. `pnpm licenses list --prod` provides a dependency metadata inventory;
it is not a substitute for the actual notices.

Component documentation lists the libraries used by each component under
“Built with.” Registry metadata installs those dependencies through the consumer's
package manager rather than relicensing their source as Dethink code.

## Showcase fonts

The showcase uses Manrope, Bricolage Grotesque, and JetBrains Mono under the SIL
Open Font License 1.1. Their full copyright and license notices are included in
the showcase's public directory so they accompany deployed font assets:

| Font                | Included notice                                                        | Upstream source                                                                  |
| ------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Manrope             | [OFL notice](apps/showcase/public/licenses/manrope-OFL.txt)            | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/manrope)            |
| Bricolage Grotesque | [OFL notice](apps/showcase/public/licenses/bricolagegrotesque-OFL.txt) | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/bricolagegrotesque) |
| JetBrains Mono      | [OFL notice](apps/showcase/public/licenses/jetbrainsmono-OFL.txt)      | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/jetbrainsmono)      |

The component registry and package do not include these font files. If you copy
or redistribute the showcase fonts, preserve their OFL notices.

## Images and branding

The code license does not cover showcase photography, avatars, generated concept
images, screenshots, or brand artwork, unless an asset is explicitly licensed
separately. These assets are not included in the component registry or package.
Replace them with your own assets when adapting a recipe, or obtain the relevant
permission before reusing them. This exclusion concerns visual assets, not the
MIT-licensed recipe implementation.

No trademark rights to the Dethink name or logo are granted. Third-party names
and marks remain the property of their respective owners.
