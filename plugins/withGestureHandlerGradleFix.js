const { withProjectBuildGradle } = require('@expo/config-plugins');

const PATCH = `subprojects { subproject ->
  if (subproject.name == "react-native-gesture-handler") {
    subproject.afterEvaluate {
      def codegenTask = tasks.findByName("generateCodegenArtifactsFromSchema")
      def releaseSourcesJarTask = tasks.findByName("releaseSourcesJar")

      if (codegenTask != null && releaseSourcesJarTask != null) {
        releaseSourcesJarTask.dependsOn(codegenTask)
      }
    }
  }
}`;

module.exports = function withGestureHandlerGradleFix(config) {
  return withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    if (contents.includes('releaseSourcesJarTask.dependsOn(codegenTask)')) {
      return config;
    }

    config.modResults.contents = contents.replace(
      '\napply plugin: "expo-root-project"',
      `\n${PATCH}\n\napply plugin: "expo-root-project"`
    );

    return config;
  });
};
