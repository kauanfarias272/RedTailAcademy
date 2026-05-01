package app.redtail.academy;

import android.Manifest;
import android.content.Intent;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.ArrayList;
import java.util.Locale;

@CapacitorPlugin(
    name = "MandarinSpeech",
    permissions = {
        @Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = "microphone")
    }
)
public class MandarinSpeechPlugin extends Plugin {
    private SpeechRecognizer speechRecognizer;
    private PluginCall activeCall;

    @PluginMethod
    public void listen(PluginCall call) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "microphonePermissionCallback");
            return;
        }

        startListening(call);
    }

    @PermissionCallback
    private void microphonePermissionCallback(PluginCall call) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) {
            startListening(call);
        } else {
            call.reject("Permissao do microfone negada.");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        stopRecognizer();
        call.resolve();
    }

    private void startListening(PluginCall call) {
        if (!SpeechRecognizer.isRecognitionAvailable(getContext())) {
            call.reject("Reconhecimento de voz nao esta disponivel neste aparelho.");
            return;
        }

        stopRecognizer();
        activeCall = call;
        activeCall.setKeepAlive(true);

        getActivity().runOnUiThread(() -> {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(getContext());
            speechRecognizer.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle params) {}
                @Override public void onBeginningOfSpeech() {}
                @Override public void onRmsChanged(float rmsdB) {}
                @Override public void onBufferReceived(byte[] buffer) {}
                @Override public void onEndOfSpeech() {}
                @Override public void onPartialResults(Bundle partialResults) {}
                @Override public void onEvent(int eventType, Bundle params) {}

                @Override
                public void onError(int error) {
                    PluginCall pendingCall = activeCall;
                    activeCall = null;
                    stopRecognizer();
                    if (pendingCall != null) {
                        pendingCall.setKeepAlive(false);
                        pendingCall.reject(errorMessage(error));
                    }
                }

                @Override
                public void onResults(Bundle results) {
                    ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    PluginCall pendingCall = activeCall;
                    activeCall = null;
                    stopRecognizer();

                    if (pendingCall == null) return;
                    pendingCall.setKeepAlive(false);

                    if (matches == null || matches.isEmpty()) {
                        pendingCall.reject("Nao veio transcricao do microfone.");
                        return;
                    }

                    JSObject response = new JSObject();
                    response.put("transcript", matches.get(0));
                    response.put("matches", new JSArray(matches));
                    pendingCall.resolve(response);
                }
            });

            String language = call.getString("language", Locale.SIMPLIFIED_CHINESE.toLanguageTag());
            String prompt = call.getString("prompt", "Repita a frase em mandarim");
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, language);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, language);
            intent.putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, true);
            intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
            intent.putExtra(RecognizerIntent.EXTRA_PROMPT, prompt);
            speechRecognizer.startListening(intent);
        });
    }

    private void stopRecognizer() {
        if (speechRecognizer == null) return;
        getActivity().runOnUiThread(() -> {
            if (speechRecognizer != null) {
                speechRecognizer.stopListening();
                speechRecognizer.destroy();
                speechRecognizer = null;
            }
        });
    }

    private String errorMessage(int error) {
        switch (error) {
            case SpeechRecognizer.ERROR_AUDIO:
                return "Falha de audio no microfone.";
            case SpeechRecognizer.ERROR_CLIENT:
                return "Reconhecimento interrompido pelo aparelho.";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                return "Permita o microfone para gravar.";
            case SpeechRecognizer.ERROR_NETWORK:
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                return "Reconhecimento precisa de rede neste aparelho.";
            case SpeechRecognizer.ERROR_NO_MATCH:
                return "Nao encontrei uma frase clara. Tente falar mais perto do microfone.";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                return "Microfone ocupado. Tente novamente.";
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                return "Nao ouvi fala a tempo. Toque em Gravar e fale logo em seguida.";
            default:
                return "Microfone nao retornou audio claro.";
        }
    }

    @Override
    protected void handleOnDestroy() {
        stopRecognizer();
        super.handleOnDestroy();
    }
}
