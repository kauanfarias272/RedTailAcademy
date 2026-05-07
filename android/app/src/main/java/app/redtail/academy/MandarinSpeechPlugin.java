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
    private static final long SPEECH_TIMEOUT = 30000; // 30 seconds
    private static final int MAX_RESULTS = 5;

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
            call.reject("Permissão do microfone negada.");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        stopRecognizer();
        call.resolve();
    }

    private void startListening(PluginCall call) {
        if (!SpeechRecognizer.isRecognitionAvailable(getContext())) {
            call.reject("Reconhecimento de voz não está disponível neste aparelho.");
            return;
        }

        try {
            stopRecognizer();
            activeCall = call;
            activeCall.setKeepAlive(true);

            getActivity().runOnUiThread(() -> {
                try {
                    speechRecognizer = SpeechRecognizer.createSpeechRecognizer(getContext());
                    if (speechRecognizer == null) {
                        if (activeCall != null) {
                            activeCall.reject("Não foi possível criar o reconhecedor de voz.");
                            activeCall = null;
                        }
                        return;
                    }

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
                                pendingCall.reject("Nenhuma transcrição recebida do microfone.");
                                return;
                            }

                            JSObject response = new JSObject();
                            response.put("transcript", matches.get(0));
                            response.put("matches", new JSArray(matches.subList(0, Math.min(MAX_RESULTS, matches.size()))));
                            response.put("confidence", results.getFloatArray(SpeechRecognizer.CONFIDENCE_SCORES));
                            pendingCall.resolve(response);
                        }
                    });

                    Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.SIMPLIFIED_CHINESE.toLanguageTag());
                    intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 2000);
                    intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, MAX_RESULTS);
                    intent.putExtra("android.speech.extra.EXTRA_ADDITIONAL_LANGUAGE_MODEL", true);

                    speechRecognizer.startListening(intent);

                    // Set timeout
                    getActivity().getWindow().getDecorView().postDelayed(() -> {
                        if (speechRecognizer != null) {
                            stopRecognizer();
                            if (activeCall != null) {
                                activeCall.setKeepAlive(false);
                                activeCall.reject("Tempo limite de escuta atingido.");
                                activeCall = null;
                            }
                        }
                    }, SPEECH_TIMEOUT);
                } catch (Exception e) {
                    android.util.Log.e("MandarinSpeech", "Error starting listening", e);
                    if (activeCall != null) {
                        activeCall.reject("Erro ao iniciar a escuta: " + e.getMessage());
                        activeCall = null;
                    }
                }
            });
        } catch (Exception e) {
            android.util.Log.e("MandarinSpeech", "Error in startListening", e);
            call.reject("Erro: " + e.getMessage());
        }
    }

    private void stopRecognizer() {
        try {
            if (speechRecognizer != null) {
                speechRecognizer.cancel();
                speechRecognizer.destroy();
                speechRecognizer = null;
            }
        } catch (Exception e) {
            android.util.Log.e("MandarinSpeech", "Error stopping recognizer", e);
        }
    }

    private String errorMessage(int error) {
        switch (error) {
            case SpeechRecognizer.ERROR_AUDIO:
                return "Erro no áudio do dispositivo";
            case SpeechRecognizer.ERROR_CLIENT:
                return "Erro do cliente";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                return "Permissões insuficientes";
            case SpeechRecognizer.ERROR_NETWORK:
                return "Erro de rede";
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                return "Tempo limite de rede excedido";
            case SpeechRecognizer.ERROR_NO_MATCH:
                return "Nenhuma correspondência encontrada";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                return "Reconhecedor ocupado";
            case SpeechRecognizer.ERROR_SERVER:
                return "Erro do servidor";
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                return "Tempo limite de fala excedido";
            default:
                return "Erro desconhecido";
        }
    }

    @Override
    protected void handleOnDestroy() {
        stopRecognizer();
        super.handleOnDestroy();
    }
}
