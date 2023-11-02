import type { Infer } from 'superstruct';
import {
  create,
  object,
  optional,
  record,
  string,
  StructError,
} from 'superstruct';

import type { SnapManifest } from './manifest';
import type { VirtualFile } from './virtual-file';

export const LOCALIZABLE_FIELDS = ['description', 'proposedName'] as const;

export const LocalizationFileStruct = object({
  locale: string(),
  messages: record(
    string(),
    object({
      message: string(),
      description: optional(string()),
    }),
  ),
});

export type LocalizationFile = Infer<typeof LocalizationFileStruct>;

/**
 * Validate a list of localization files.
 *
 * @param localizationFiles - The localization files to validate.
 * @returns The validated localization files.
 * @throws If any of the files are considered invalid.
 */
export function getValidatedLocalizationFiles(
  localizationFiles: VirtualFile[],
): VirtualFile<LocalizationFile>[] {
  for (const file of localizationFiles) {
    try {
      file.result = create(JSON.parse(file.toString()), LocalizationFileStruct);
    } catch (error) {
      if (error instanceof StructError) {
        throw new Error(
          `Failed to validate localization file "${file.path}": ${error.message}.`,
        );
      }

      if (error instanceof SyntaxError) {
        throw new Error(
          `Failed to parse localization file "${file.path}" as JSON.`,
        );
      }

      throw error;
    }
  }

  return localizationFiles as VirtualFile<LocalizationFile>[];
}

/**
 * Get the localization file for a given locale. If the locale is not found,
 * the English localization file will be returned.
 *
 * @param locale - The locale to use.
 * @param localizationFiles - The localization files to use.
 * @returns The localization file, or `undefined` if no localization file was
 * found.
 */
export function getLocalizationFile(
  locale: string,
  localizationFiles: LocalizationFile[],
) {
  const file = localizationFiles.find(
    (localizationFile) => localizationFile.locale === locale,
  );

  if (!file) {
    return localizationFiles.find(
      (localizationFile) => localizationFile.locale === 'en',
    );
  }

  return file;
}

export const TRANSLATION_REGEX = /\{\{\s?([a-zA-Z0-9-_\s]+)\s?\}\}/gu;

/**
 * Translate a string using a localization file. This will replace all instances
 * of `${key}` with the localized version of `key`. If the key is not found,
 * the original string will be returned.
 *
 * @param value - The string to translate.
 * @param file - The localization file to use.
 * @returns The translated string.
 */
export function translate(value: string, file: LocalizationFile) {
  const matches = value.matchAll(TRANSLATION_REGEX);
  const array = Array.from(matches);

  return array.reduce<string>((result, [match, key]) => {
    const translation = file.messages[key.trim()];
    if (translation) {
      return result.replace(match, translation.message);
    }

    return result;
  }, value);
}

/**
 * Get the localized Snap manifest for a given locale. This will replace all
 * localized strings in the manifest with the localized version.
 *
 * @param snapManifest - The Snap manifest to localize.
 * @param locale - The locale to use.
 * @param localizationFiles - The localization files to use.
 * @returns The localized Snap manifest.
 */
export function getLocalizedSnapManifest(
  snapManifest: SnapManifest,
  locale: string,
  localizationFiles: LocalizationFile[],
) {
  const file = getLocalizationFile(locale, localizationFiles);
  if (!file) {
    return snapManifest;
  }

  return LOCALIZABLE_FIELDS.reduce((manifest, field) => {
    const translation = translate(manifest[field], file);
    return {
      ...manifest,
      [field]: translation,
    };
  }, snapManifest);
}