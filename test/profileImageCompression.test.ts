import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PROFILE_IMAGE_JPEG_QUALITY,
  PROFILE_IMAGE_MAX_DIMENSION,
  PROFILE_IMAGE_OUTPUT_TYPE,
  buildCompressedProfileImageName,
  resolveProfileImageTargetSize,
} from '../src/profile/profileImageCompression.ts'

test('profile image compression constants keep avatar uploads small', () => {
  assert.equal(PROFILE_IMAGE_MAX_DIMENSION, 320)
  assert.equal(PROFILE_IMAGE_JPEG_QUALITY, 0.62)
  assert.equal(PROFILE_IMAGE_OUTPUT_TYPE, 'image/jpeg')
})

test('profile image target size preserves aspect ratio within the max dimension', () => {
  assert.deepEqual(resolveProfileImageTargetSize(1200, 600), {
    width: 320,
    height: 160,
  })
  assert.deepEqual(resolveProfileImageTargetSize(600, 1200), {
    width: 160,
    height: 320,
  })
  assert.deepEqual(resolveProfileImageTargetSize(240, 120), {
    width: 240,
    height: 120,
  })
})

test('compressed profile image filename always targets jpg output', () => {
  assert.equal(buildCompressedProfileImageName('avatar.png'), 'avatar-profile.jpg')
  assert.equal(buildCompressedProfileImageName('김일로그.png'), 'profile-profile.jpg')
})
