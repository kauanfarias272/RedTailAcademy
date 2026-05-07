package app.redtail.academy;

import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Locale;
import java.util.HashMap;

@CapacitorPlugin(name = "MandarinTts")
public class MandarinTtsPlugin extends Plugin implements TextToSpeech.OnInitListener {
    private TextToSpeech textToSpeech;
    private boolean ready = false;
    private static final int MAX_TEXT_LENGTH = 500;
    private static final float MIN_RATE = 0.5f;
    private static final float MAX_RATE = 2.0f;

    @Override
    public void load() {
        try {
            textToSpeech = new TextToSpeech(getContext(), this);
        } catch (Exception e) {
            android.util.Log.e("MandarinTts", "Failed to initialize TTS", e);
        }
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS && textToSpeech != null) {
            try {
                int languageStatus = textToSpeech.setLanguage(Locale.SIMPLIFIED_CHINESE);
                ready = languageStatus != TextToSpeech.LANG_MISSING_DATA && languageStatus != TextToSpeech.LANG_NOT_SUPPORTED;
                
                // Set up utterance listener for callback
                textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override
                    public void onStart(String utteranceId) {}
                    
                    @Override
                    public void onDone(String utteranceId) {
                        // Handle completion if needed
                    }
                    
                    @Override
                    public void onError(String utteranceId) {
                        android.util.Log.w("MandarinTts", "Utterance error: " + utteranceId);
                    }
                });
            } catch (Exception e) {
                android.util.Log.e("MandarinTts", "Error during init", e);
                ready = false;
            }
        }
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        float rate = call.getFloat("rate", 0.78f);

        // Input validation
        if (text == null || text.trim().isEmpty()) {
            call.reject("Text is empty");
            return;
        }
        
        if (text.length() > MAX_TEXT_LENGTH) {
            call.reject("Text too long (max " + MAX_TEXT_LENGTH + " chars)");
            return;
        }
        
        // Validate rate
        rate = Math.max(MIN_RATE, Math.min(MAX_RATE, rate));

        if (textToSpeech == null) {
            try {
                textToSpeech = new TextToSpeech(getContext(), this);
            } catch (Exception e) {
                call.reject("Failed to reinitialize TTS");
                return;
            }
        }

        if (!ready) {
            call.reject("Mandarin TTS is not ready or language not supported");
            return;
        }

        try {
            textToSpeech.setLanguage(Locale.SIMPLIFIED_CHINESE);
            textToSpeech.setSpeechRate(rate);
            
            // Add unique ID for tracking
            String utteranceId = "redtail-" + System.currentTimeMillis();
            HashMap<String, String> params = new HashMap<>();
            params.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId);
            
            textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, params);

            JSObject response = new JSObject();
            response.put("spoken", true);
            response.put("utteranceId", utteranceId);
            call.resolve(response);
        } catch (Exception e) {
            android.util.Log.e("MandarinTts", "Error during speak", e);
            call.reject("Error speaking: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        try {
            if (textToSpeech != null) {
                textToSpeech.stop();
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Error stopping TTS");
        }
    }

    @PluginMethod
    public void isReady(PluginCall call) {
        JSObject response = new JSObject();
        response.put("ready", ready);
        call.resolve(response);
    }

    @Override
    protected void handleOnDestroy() {
        try {
            if (textToSpeech != null) {
                textToSpeech.stop();
                textToSpeech.shutdown();
                textToSpeech = null;
            }
        } catch (Exception e) {
            android.util.Log.e("MandarinTts", "Error during destroy", e);
        } finally {
            ready = false;
            super.handleOnDestroy();
        }
    }
}
